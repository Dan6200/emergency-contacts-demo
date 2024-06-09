import Search from "@/components/residents/search";
import Link from "next/link";
export default function ManageResidents() {
  return (
    <main className="bg-background text-center mx-auto py-8">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Manage Resident Information
      </h1>
      <Search />
      <div className="w-4/5 border-2 mx-auto my-8"></div>
      <Link
        href={"/residents/add"}
        className="text-blue-700 underline capitalize text-xl"
      >
        <h3>Add new resident</h3>
      </Link>
    </main>
  );
}
