import { mutateResidentData } from "@/app/residents/functions";
import { ResidentForm } from "@/components/residents-form";

export default async function AddResidentPage() {
  return (
    <main className="bg-background container w-full my-8 md:w-2/3 mx-auto md:my-16">
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
