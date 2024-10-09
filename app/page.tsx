import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Residence } from "@/types/resident";
import Link from "next/link";
import { getAllRooms } from "./admin/residents/data-actions";
import { redirect } from "next/navigation";

export const revalidate = 60;

export default async function Home() {
  const rooms = await getAllRooms().catch((e) => {
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
  });
  return (
    <main className="sm:container bg-background text-center mx-auto py-32 sm:py-24">
      <div className="w-fit rounded-md border-2 mx-auto">
        <Table className="text-base w-full">
          <TableCaption>All Rooms In The Facility.</TableCaption>
          <TableHeader className="bg-foreground/20 font-bold rounded-md">
            <TableRow>
              <TableHead className="text-center md:w-48">Keyword</TableHead>
              <TableHead className="text-center md:w-48">Room</TableHead>
              <TableHead className="text-left">Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms?.map(
              ({
                id,
                roomNo,
                residence_id,
                address,
              }: Residence & { id: string }) => {
                return (
                  <TableRow key={id}>
                    <TableCell className="text-center">
                      <Link href={`/room/${id}`} className="w-full block">
                        {residence_id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href={`/room/${id}`} className="w-full block">
                        {roomNo}
                      </Link>
                    </TableCell>
                    <TableCell className="text-left">
                      <Link href={`/room/${id}`} className="w-full block">
                        {address}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
