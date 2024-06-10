import { ResidentForm } from "@/components/residents-form/resident";
import { getAuthenticatedAppForUser } from "@/server";

export default async function EditResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { currentUser: initialUser } = await getAuthenticatedAppForUser();
  //TODO: fetch info with id|or pass info through url
  return (
    <main className="bg-background container w-full md:w-2/3 mx-auto my-16 max-h-screen">
      <ResidentForm
        {...{ initialUser, address: "", name: "", unit_number: "" }}
      />
    </main>
  );
}
