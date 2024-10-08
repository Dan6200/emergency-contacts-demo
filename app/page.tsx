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

export const revalidate = 60;

export default async function Home() {
  const rooms = await getAllRooms().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:14.\n\t" + e);
  });
  // TODO: switch to tables
  return (
    <main className="sm:container bg-background text-center mx-auto py-24">
      <Table className="text-base w-fit mx-auto">
        <TableCaption>All Rooms In The Facility.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left w-48">Keyword</TableHead>
            <TableHead className="text-left w-32">Room</TableHead>
            <TableHead className="text-left">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map(
            ({
              id,
              roomNo,
              residence_id,
              address,
            }: Residence & { id: string }) => {
              return (
                <TableRow key={id}>
                  <TableCell className="text-left">
                    <Link href={`/room/${id}`}>{residence_id}</Link>
                  </TableCell>
                  <TableCell className="text-left">
                    <Link href={`/room/${id}`}>{roomNo}</Link>
                  </TableCell>
                  <TableCell className="text-left">
                    <Link href={`/room/${id}`}>{address}</Link>
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </main>
  );
}
