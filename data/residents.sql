select distinct id_2 as id, trim (residents) as residents, addresses, unit_number from normalized_data order by id asc;
