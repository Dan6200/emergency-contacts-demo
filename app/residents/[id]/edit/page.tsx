"use client";
import { ResidentForm } from "@/components/residents-form/resident";
import { useAtomValue } from "jotai";
import peopleAtom from "@/data/people-atom";

export default function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const people = useAtomValue(peopleAtom);
  const index = parseInt(id) - 1;
  const person = people[index];
  const { firstName, lastName, phone, address } = person;
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm {...{ address, firstName, lastName, phone, id }} />
    </main>
  );
}
