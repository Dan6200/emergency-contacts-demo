import Search from "@/components/residents/search";
import { Button } from "@/components/ui/button";
export default function ManageResidents() {
  return (
    <main className="bg-background text-center mx-auto py-8">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Manage Resident Information
      </h1>
      <Search />
      <Button className="w-4/5">Add New Residents</Button>
    </main>
  );
}
