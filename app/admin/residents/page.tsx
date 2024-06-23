import { getAllResidentsDataLite } from "./data";
import Search from "@/components/residents/search";

export const revalidate = 60;

export default async function Residents() {
  const residents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:14.\n\t" + e);
  });
  return (
    <main className="sm:container bg-background text-center mx-auto py-32">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Search Resident Information
      </h1>
      <Search {...{ residents }} />
    </main>
  );
}
