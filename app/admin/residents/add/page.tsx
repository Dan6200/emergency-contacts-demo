import { ResidentForm } from "@/components/residents-form/resident";
import { getAuthenticatedAppForUser } from "@/server";

export default async function AddResidentPage() {
  const { currentUser: initialUser } = await getAuthenticatedAppForUser();
  return (
    <main className="bg-background container w-full my-8 md:w-2/3 mx-auto md:my-16 max-h-screen">
      <ResidentForm
        {...{
          initialUser,
          address: "",
          name: "",
          unit_number: "",
        }}
      />
    </main>
  );
}
