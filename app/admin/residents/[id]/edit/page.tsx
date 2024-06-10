import { ResidentForm } from "@/components/residents-form/resident";

export default async function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  //TODO: fetch info with id|or pass info through url
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm {...{ address: "", name: "", unit_number: "" }} />
    </main>
  );
}
