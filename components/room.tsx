"use client";
import userAtom from "@/atoms/user";
import type { Resident, RoomData } from "@/types/resident";
import { useAtomValue } from "jotai";
import { PhoneCall } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";

export default function Room({
  roomData,
  children,
}: {
  roomData: RoomData;
  children: ReactNode;
}) {
  const admin = useAtomValue(userAtom),
    router = useRouter();
  const residents = roomData.residents;

  return (
    <main className="bg-background flex flex-col gap-5 container mx-auto text-center py-32 h-fit">
      <section className="flex flex-col gap-4 mb-8">
        <h1 className="text-5xl mb-4 font-bold">{roomData.residence_id}</h1>
        <p className="font-semibold">Room: {roomData.roomNo}</p>
        <p className="">{roomData.address}</p>
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full">
        {residents &&
          residents.map((resident, index) => (
            <Link
              href={`/admin/residents/${resident.resident_id}`}
              key={resident.resident_id}
              className="h-fit"
            >
              <Card className="hover:bg-green-700/10 active:bg-green-700/10 flex shadow-md p-4 w-full md:p-6 items-center md:h-[30vh] min-w-[40vw]">
                <CardHeader>
                  <Image
                    src="/profile.svg"
                    alt="profile svg icon"
                    className="border-4 border-black rounded-full"
                    width={64}
                    height={64}
                  />
                </CardHeader>
                <CardContent className="grow p-0 flex flex-col justify-between h-3/5 text-left">
                  <h3 className="capitalize items-center font-semibold md:text-xl">
                    {resident.resident_name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full md:w-4/5 lg:w-2/3 mx-auto">
        {admin && (
          <div className="flex gap-5 flex-wrap items-center justify-center md:w-2/3">
            <Button
              className="md:w-full grow shrink basis-0"
              onMouseDown={() =>
                router.push(`/admin/residents/${roomData.id}/add`)
              }
            >
              Add New Resident
            </Button>
            {children}
          </div>
        )}
      </section>
    </main>
  );
}
