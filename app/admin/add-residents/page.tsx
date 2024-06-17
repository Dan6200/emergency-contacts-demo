import { mutateResidentData } from "@/app/residents/functions";
import { GoBackLink } from "@/components/go-back-link";
import { ResidentForm } from "@/components/residents/form";

export default async function AddResidentPage() {
  return (
    <main className="flex flex-col gap-5 bg-background container w-full md:w-2/3 mx-auto py-32">
      <GoBackLink className="cursor-pointer text-blue-700 flex w-full sm:w-3/5 gap-2 sm:gap-5">
        Go To Previous Page
      </GoBackLink>
      <ResidentForm
        {...{
          address: "",
          name: "",
          unit_number: "",
          mutateResidents: mutateResidentData,
        }}
      />
    </main>
  );
}
