"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/firebase/client/config";
import { Residence } from "@/types/resident";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RoomList({
  rooms,
}: {
  rooms: (Residence & { id: string })[];
}) {
  const [admin, setAdmin] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAdmin(currentUser);
    });
    return () => unsubscribe();
  }, [setAdmin]);

  return (
    admin && (
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
    )
  );
}
