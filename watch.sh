#!/bin/bash

cd "$(dirname $0)" || exit

readonly TARGET_PATH=~/.config/karabiner/assets/complex_modifications/

function reload_json() {
  local title
  title=$(yq '.title' "$1")

  local description
  description=$(yq '.rules[0].description' "$1")

  ./reload_complex_modification.js "${title}" "${description}"
}

export -f reload_json

# YAML to JSON
find "${TARGET_PATH}" -type f -path '*.yml' -print0 |
  xargs -0 -I {} sh -c './yaml_to_json.sh "{}"'

sleep 1

# watch YAML and convert to JSON
fswatch -0 "${TARGET_PATH}" -e '.*' -i "\\.yml$" |
  xargs -0 -n1 -I {} sh -c './yaml_to_json.sh {}' &

# watch JSON and reload
fswatch -0 "${TARGET_PATH}" -e '.*' -i "\\.json$" |
  xargs -0 -I {} bash -c "reload_json {}"
