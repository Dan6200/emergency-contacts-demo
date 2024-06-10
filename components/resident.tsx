"use client";
import type { Resident } from "@/types/resident";
import { Phone, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "./ui/card";

export default function Resident({ resident }: { resident: Resident }) {
  const emergencyContacts = resident.emergency_contacts;
  const emConIds = resident.emergency_contact_id;
  return (
    <main className="bg-background flex flex-col gap-5 container md:w-[70vw] md:px-8 mx-auto md:my-16 text-center py-8 max-h-screen">
      <section className="flex flex-col gap-2 mb-8">
        <h1 className="text-5xl mb-4 font-bold">{resident.name}</h1>
        <p className="font-semibold">Room: {resident.unit_number}</p>
        <p className="">{resident.address}</p>
      </section>
      {emergencyContacts &&
        emergencyContacts.map((contact, index) => (
          <Link
            href={`tel:${contact.phone_number
              .replaceAll(/\s/g, "-")
              .replaceAll(/\(|\)/g, "")}`}
          >
            <Card
              className="hover:bg-muted flex shadow-md p-4 items-center"
              key={emConIds[index]}
            >
              <CardContent className="grow p-0 text-left">
                <h3 className="capitalize">{contact.name}</h3>
                <p className="capitalize">{contact.relationship}</p>
                <p>{contact.phone_number}</p>
              </CardContent>
              <CardFooter className="shrink p-2">
                <span className="border-4 border-green-700 w-16 h-16 flex items-center rounded-full">
                  <PhoneCall className="text-green-700 font-bold mx-auto" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
    </main>
  );
}
