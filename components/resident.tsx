"use client";
import { DocumentData } from "firebase/firestore";

export interface Resident {
  id: string;
  name: string;
  address: string;
  unit_number: string;
  emergency_contact_id?: string[];
}

export default function Resident(docData: DocumentData) {
  console.log(docData);
  /* const index = parseInt(id) - 1; */

  return (
    <main className="bg-background flex flex-col gap-5 container md:w-[70vw] md:px-8 mx-auto md:my-16 text-center py-8 max-h-screen">
      <h1 className="text-3xl"></h1>
      <p></p>
      <p></p>
      {/* <Link href={id + "/edit/"}> */}
      {/*   <Button></Button> */}
      {/* </Link> */}
      {/*emergencyContacts && emergencyContacts.has(id) && (
        <ul className="text-left mx-auto w-[80%] md:w-full">
          <h2 className="text-xl my-8 font-bold">Emergency Contacts</h2>
          <div className="flex gap-10 flex-col md:flex-row md:flex-wrap">
            {emergencyContacts.get(id)?.map((contact, index) => {
              const contactsFullName =
                  contact.firstName + " " + contact.lastName,
                { address, phone, relationship } = contact;
              return (
                <li key={index}>
                  <h3 className="text-lg font-semibold">Contact {index + 1}</h3>
                  <p>Name: {contactsFullName}</p>
                  <p>Phone: {phone}</p>
                  <p>Address: {address}</p>
                  <p>Relationship To Patient: {relationship}</p>
                </li>
              );
            })}
          </div>
        </ul>
				)*/}
      {/* <Link href={id + "/emergency-contact/add/"}> */}
      {/*   <Button>Add Emergency Contact</Button> */}
      {/* </Link> */}
    </main>
  );
}
