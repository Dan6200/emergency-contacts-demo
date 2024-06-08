#!/bin/zsh
source $HOME/.config/.zsh_aliases
table_name="$1"
columns="($2)"  # List your columns here
csv_file="$3"

conn_db -c "\copy ${table_name} ${columns} from '${csv_file}' with (format csv, delimiter ',', header true);"
