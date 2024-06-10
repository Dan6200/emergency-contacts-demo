import Search from "@/components/residents/search";
import { getAuthenticatedAppForUser } from "@/server";
export default async function SearchResidents() {
  const { currentUser: initialUser } = await getAuthenticatedAppForUser();
  return (
    <main className="bg-background text-center mx-auto py-8">
      <h1 className="text-2xl font-semibold w-4/5 mx-auto">
        Search Resident Information
      </h1>
      <Search {...{ initialUser }} />
    </main>
  );
}
