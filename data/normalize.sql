insert into normalized_data (id_2, residents , addresses , unit_number, emergency_contact, relationship, phone_number)
select id, residents ,addresses ,unit_number ,emergency_contact_1 as emergency_contact, relationship_1 as relationship, phone_number_1 as phone_number from data where emergency_contact_1 is not null 
union all
select id, residents ,addresses ,unit_number ,emergency_contact_2 as emergency_contact, relationship_2 as relationship, phone_number_2 as phone_number from data where emergency_contact_2 is not null 
union all
select id, residents ,addresses ,unit_number ,emergency_contact_3 as emergency_contact, relationship_3 as relationship, phone_number_3 as phone_number from data where emergency_contact_3 is not null 
union all
select id, residents ,addresses ,unit_number ,emergency_contact_4 as emergency_contact, relationship_4 as relationship, phone_number_4 as phone_number from data where emergency_contact_4 is not null 
union all
select id, residents ,addresses ,unit_number ,emergency_contact_5 as emergency_contact, relationship_5 as relationship, phone_number_5 as phone_number from data where emergency_contact_5 is not null 
