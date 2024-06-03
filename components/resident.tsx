"use client";
import peopleAtom from "@/data/people-atom";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { Button } from "./ui/button";

interface ResidentProps {
  id: string;
}

export default function Resident({ id }: ResidentProps) {
  const people = useAtomValue(peopleAtom);
  const index = parseInt(id) - 1;
  const person = people[index];
  const fullName = person.firstName + " " + person.lastName,
    phone = person.phone,
    address = person.address;

  return (
    <main className="bg-background flex flex-col gap-5 container w-[70vw] px-8 mx-auto my-16 text-center py-8 max-h-screen">
      <h1 className="text-3xl">{fullName}</h1>
      <p>Phone: {phone}</p>
      <p>Address: {address}</p>
      <Link href={"/edit/" + id}>
        <Button>Edit Resident</Button>
      </Link>
    </main>
  );
}
