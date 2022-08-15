#!/usr/bin/osascript -l JavaScript

// handle arguments
ObjC.import('stdlib');
const arguments = [];
{
    const processArguments = $.NSProcessInfo.processInfo.arguments;
    const count = processArguments.count;

    if (count <= 5) {
        const fileName = ObjC.unwrap(processArguments.objectAtIndex(3));
        console.log(`usage: ${fileName} title description`);
        $.exit(1);
    }

    // skip 3-words run command at top and this file's name
    for (let i = 4; i < count; i++) {
        const argument = ObjC.unwrap(processArguments.objectAtIndex(i));
        arguments.push(argument);
    }
}

const targetModification = {
    title: arguments[0],
    description: arguments[1] ?? arguments[0],
}

console.log(JSON.stringify(targetModification));

// main routine
{
    const Karabiner = Application("org.pqrs.Karabiner-Elements.Preferences");
    Karabiner.launch();

    const SystemEvents = Application("System Events");
    const process = SystemEvents.applicationProcesses.byName("Karabiner-Elements");
    const window = process.windows.byName("Karabiner-Elements Preferences");

    try {
        // load
        window.entireContents();

        window.buttons.byName("Complex Modifications").click();

        {
            const rows = window.scrollAreas.at(0).tables.at(0).rows;

            // delete existing setting
            for (let i = 0; i < rows.length; i++) {
                const uiElement = rows.at(i).uiElements.at(0);
                const description = uiElement.staticTexts.name();

                if (description == targetModification.description) {
                    uiElement.buttons.byName("Trash").click();
                    console.log(`disabled: "${description}"`);

                    // reload
                    window.entireContents();

                    break;
                }

                if (i === rows.length - 1) {
                    console.log(`"${arguments[0]}" was not found and not disabled.`);
                }
            }

            // scroll if needed
            if (2 <= window.scrollAreas.uiElements.length) {
                window.scrollAreas.at(0).scrollBars.at(0).value = 1;
            }

            // open "Add rule" sheet
            const buttons = rows.last().uiElements.at(0).buttons;
            buttons.byName("Add rule").click();
        }
        {
            // load
            window.sheets.entireContents();

            const scrollArea = window.sheets.at(0).scrollAreas.at(0);
            const scrollBar = scrollArea.scrollBars.at(0);
            const table = scrollArea.tables.at(0);
            const rows = table.rows;

            const scrollAreaHeight = table.size().at(1);
            const totalHeight = rows.size().map(arr => arr.at(1)).reduce((a, b) => a + b);

            let scrolledHeight = 0;

            // add new setting
            OUTER_LOOP:
                for (let i = 0; i < rows.length; i++) {
                    // scroll
                    if (scrollBar.exists() && (1 <= i)) {
                        scrolledHeight += rows.at(i - 1).size().at(1);
                        scrollBar.value = Math.min(scrolledHeight / (totalHeight - scrollAreaHeight), 1);
                    }

                    const groups = rows.at(i).uiElements.at(0).groups;
                    // load
                    groups.entireContents();

                    const title = groups.at(0).staticTexts.at(0).name();

                    if (title == targetModification.title) {
                        const staticTexts = groups.at(0).staticTexts;

                        for (let j = 1; j < staticTexts.length; j++) {
                            // scroll
                            if (scrollBar.exists() && (1 <= j)) {
                                scrolledHeight += staticTexts.at(j - 1).size().at(1);
                                scrollBar.value = Math.min(scrolledHeight / (totalHeight - scrollAreaHeight), 1);
                            }

                            const staticText = staticTexts.at(j);
                            const description = staticText.name();

                            if (description == targetModification.description) {
                                console.log(`enabled: "${description}"`);

                                // NOTE: sheet will be closed automatically
                                groups.at(0).buttons.at(j - 1).click();

                                break OUTER_LOOP;
                            }

                            if (j == staticTexts.length - 1) {
                                throw new Error(`description not found: "${targetModification.description}"`);
                            }
                        }

                        break;
                    }

                    if (i == rows.length - 1) {
                        throw new Error(`title not found: "${targetModification.title}"`);
                    }
                }
        }
    } catch (error) {
        console.log(error);

        try {
            // WARNING: if the sheet is left open, app cannot be quited.
            window.sheets.entireContents();
            window.sheets.at(0).buttons.byName("Close").click();
        } finally {
            Karabiner.quit();
            $.exit(1);
        }
    }

    Karabiner.quit();
    Application("org.pqrs.Karabiner-EventViewer").activate();

    $.exit(0);
}
