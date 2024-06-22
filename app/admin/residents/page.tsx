import { getAllResidentsDataLite } from "@/app/actions";
import Search from "@/components/residents/search";
import { getAuthenticatedAppForUser } from "@/server";

export default async function Residents() {
  const { currentUser } = await getAuthenticatedAppForUser();
  console.log("fetch residents authenticated: ", currentUser?.email);
  const residents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:14.\n\t" + e);
  });
  return (
    <main className="sm:container bg-background text-center mx-auto py-32">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Search Resident Information
      </h1>
      <Search {...{ residents, initialUser: currentUser?.toJSON() }} />
    </main>
  );
}
