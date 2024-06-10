"use client";
import { EmergencyContactForm } from "@/components/residents-form/emergency-contact";

export default function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <EmergencyContactForm {...{ id }} />
    </main>
  );
}
