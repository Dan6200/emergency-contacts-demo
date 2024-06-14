import { getAllResidentsDataLite } from "@/app/residents/functions";
import Search from "@/components/residents/search";

export default async function Residents() {
  const residents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data:\n" + e);
  });
  return (
    <main className="sm:container bg-background text-center mx-auto py-8">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Search Resident Information
      </h1>
      <Search {...{ residents }} />
    </main>
  );
}
