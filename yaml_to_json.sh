#!/bin/bash

function abort() {
  echo "usage: $0 target_file"
  exit 1
}

if [ -z "$1" ]; then
  abort
fi

yaml_files="$(find "$1" -type f -path '*.yml')"

if [ -z "${yaml_files}" ]; then
  abort
fi

while read -a files; do
  yaml_file="${files[*]}"
  json_file="${yaml_file%\.yml}.json"

  yq -o=json "${yaml_file}" >"${json_file}" && echo "${json_file}"
done < <(echo "${yaml_files}")
