"use client";
import { ResidentForm } from "@/components/residents-form/resident";
import { useAtomValue } from "jotai";

export default function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const index = parseInt(id) - 1;
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm {...{}} />
    </main>
  );
}
