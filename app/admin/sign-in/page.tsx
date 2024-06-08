"use client";
import { useAtomValue } from "jotai";
import { SignInForm } from "@/components/sign-in-form/";

export default function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <SignInForm />
    </main>
  );
}
