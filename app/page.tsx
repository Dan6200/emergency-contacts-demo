import { getAllRooms } from "./admin/residents/data-actions";
import { redirect } from "next/navigation";
import UserList from "@/components/user-list";
import { auth } from "@/firebase/config";

export const revalidate = 60;

export default async function Home() {
  await auth.authStateReady();
  const user = auth.currentUser;
  const rooms = await getAllRooms().catch((e) => {
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
  });
  if (!rooms) throw new Error("Unable To Fetch Rooms");
  return (
    <main className="sm:container bg-background text-center mx-auto py-48 sm:py-24">
      <UserList {...{ user: user?.toJSON() ?? null, rooms }} />
    </main>
  );
}
