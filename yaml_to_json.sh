#!/bin/bash

if [ -z "$1" ]; then
  echo "usage: $0 target_file"
  exit 1
fi

yaml_file=$1
json_file="${yaml_file%\.yml}.json"

yq -o=json "${yaml_file}" >"${json_file}" && echo "${json_file}"
