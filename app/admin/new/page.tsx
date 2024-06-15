import { addAdmin } from "@/app/residents/functions";
import { GoBackLink } from "@/components/go-back-link";
import { AddAdminForm } from "@/components/register-form";
import { ArrowLeft } from "lucide-react";

export default async function RegisterPage() {
  return (
    <main className="bg-background flex flex-col gap-16 container w-full md:w-2/3 mx-auto my-8 max-h-screen">
      <GoBackLink className="cursor-pointer text-blue-700 flex w-3/5 gap-5">
        <ArrowLeft />
        Go To Previous Page
      </GoBackLink>
      <AddAdminForm {...{ addAdmin }} />
    </main>
  );
}
