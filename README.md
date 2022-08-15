Karabiner-Elements Helper
===

With this helper, you can:

* write your `Complex Modification` rule as YAML instead of JSON.
    * More precisely, the YAML file is converted to a JSON file.
* load/reload your rule automatically in the `Karabiner-Elements Preferences` window.

## How to use

1. Install [Homebrew](https://brew.sh/index_ja).

2. Install `fswatch` and `yq`.

```
$ brew install fswatch yq
```

3. Clone this repository.

```
$ git clone git@github.com:su10/Karabiner-Elements-Helper.git && cd Karabiner-Elements-Helper
```

4. Write your rule as a YAML file in `~/.config/karabiner/assets/complex_modifications/`.

```
$ touch ~/.config/karabiner/assets/complex_modifications/my_rules.yml
$ vim ~/.config/karabiner/assets/complex_modifications/my_rules.yml
```

5. Convert the YAML file to a JSON file.

```
$ ./yaml_to_json.sh my_complex_modification.yml
```

If you want to test your rule immediately, run `watch.sh` to watch changes of the file and reload automatically.

```
$ ./watch.sh
```
