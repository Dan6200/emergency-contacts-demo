import {
  getAllResidentsData,
  getResidentData,
  mutateResidentData,
} from "@/app/residents/functions";
import { ResidentForm } from "@/components/residents/form";

export default async function EditResidentPage({
  params: { id: residentId },
}: {
  params: { id: string };
}) {
  //TODO: fetch info with id|or pass info through url
  const {
    address,
    name,
    unit_number,
    emergency_contacts,
    emergency_contact_id,
  } = await getResidentData(residentId);
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto py-32 max-h-screen">
      <ResidentForm
        {...{
          residentId,
          address,
          name,
          unit_number,
          emergency_contacts,
          emergency_contact_id,
          mutateResidents: mutateResidentData,
        }}
      />
    </main>
  );
}

export async function generateStaticParams() {
  return getAllResidentsData().catch((e) => {
    throw new Error("Failed To Generate Static Pages -- Tag:20.\n\t", e);
  });
}
