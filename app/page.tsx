import Link from "next/link";
import { getAllResidentsDataLite } from "./admin/residents/data";

export const revalidate = 60;

export default async function Home() {
  const residents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:14.\n\t" + e);
  });
  return (
    <main className="sm:container bg-background text-center mx-auto py-32">
      <h1 className="text-5xl my-8">LinkID</h1>
      <div className="grid grid-cols-6 gap-4">
        {residents.map(({ id, unit_number }) => (
          <Link href={`/residents/${id}`}>
            <div
              key={id}
              className="bg-primary/10 hover:bg-primary/20 active:bg-primary/20 border-4 rounded-md h-16 w-48 flex justify-center place-items-center"
            >
              RM{unit_number}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
