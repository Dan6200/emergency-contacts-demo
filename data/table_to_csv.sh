#!/bin/zsh
source $HOME/.config/.zsh_aliases
# query to csv file
# query=" select distinct id_2 as id, trim (residents) as residents, addresses, unit_number from normalized_data order by id asc "
query="select trim (residents) as residents, addresses, unit_number , emergency_contact, relationship, phone_number from normalized_data order by id asc"
# columns="($2)"  # List your columns here
csv_file="$1"

conn_db -c "\copy (${query}) to '${csv_file}' with (format csv, delimiter ',', header true);"

