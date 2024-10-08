"use client";
import Image from "next/image";
import userAtom from "@/atoms/user";
import type { Resident, ResidentData, RoomData } from "@/types/resident";
import { useAtomValue } from "jotai";
import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

export default function Resident({
  residentData,
}: {
  residentData: ResidentData;
}) {
  const admin = useAtomValue(userAtom),
    router = useRouter();
  const { resident_name, emergencyContacts } = residentData;

  return (
    <main className="bg-background flex flex-col gap-5 container md:px-16 mx-auto text-center py-24 h-fit">
      <section className="flex flex-col items-center gap-4 mb-4">
        <Image
          src="/profile.svg"
          alt="profile svg icon"
          className="border-4 border-black rounded-full"
          width={96}
          height={96}
        />
        <h1 className="text-5xl mb-8 font-bold">{resident_name}</h1>
        <h3 className="text-xl font-bold">Contacts</h3>
      </section>
      <section className="mb-8 flex justify-center flex-wrap gap-6 w-full">
        {emergencyContacts &&
          emergencyContacts.map((contact: any, index: number) => (
            <Link
              key={index + contact.contact_name.split(" ")[0]}
              href={`tel:${contact.cell_phone}`}
              className="w-fit"
            >
              <Card className="justify-between hover:bg-green-700/10 active:bg-green-700/10 flex shadow-md p-4 w-full md:p-6 items-center md:h-[20vh] sm:w-[30vw]">
                <CardContent className="p-0 flex flex-col justify-between text-left ">
                  <h3 className="capitalize font-semibold md:text-xl">
                    {contact.contact_name}
                  </h3>
                  {contact.relationship && (
                    <p className="capitalize">{contact.relationship}</p>
                  )}
                  {contact.cell_phone && (
                    <p className="text-green-700 font-semibold">
                      {contact.cell_phone}
                    </p>
                  )}
                  {contact.home_phone && (
                    <p className="text-green-700 font-semibold">
                      {contact.home_phone}
                    </p>
                  )}
                  {contact.work_phone && (
                    <p className="text-green-700 font-semibold">
                      {contact.work_phone}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="shrink p-2">
                  <span className="border-4 border-green-700 w-16 h-16 flex items-center rounded-full">
                    <PhoneCall className="text-green-700 font-bold mx-auto" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full md:w-4/5 lg:w-2/3 mx-auto">
        <Button
          className="md:w-64"
          onMouseDown={() =>
            router.push(`/admin/residents/${residentData.resident_id}/edit`)
          }
        >
          Edit Resident Information
        </Button>
      </section>
    </main>
  );
}
