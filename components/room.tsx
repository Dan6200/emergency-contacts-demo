"use client";
import userAtom from "@/atoms/user";
import type { RoomData } from "@/types/resident";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import Image from "next/image";
import { deleteResidentData } from "@/app/admin/residents/data-actions";
import DeleteResident from "@/app/room/[id]/residents/delete";

export default function Room({ roomData }: { roomData: RoomData }) {
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
      <section className="my-8 w-full">
        <h1 className="text-xl font-semibold mb-8">Residents</h1>
        <div className="flex gap-8 justify-center mx-auto">
          {residents &&
            residents.map((resident) => (
              <Link
                href={`/room/${roomData.id}/residents/${resident.resident_id}`}
                key={resident.resident_id}
                className="h-fit"
              >
                <Card className="flex-col hover:bg-green-700/10 active:bg-green-700/10 flex shadow-md p-4 md:p-4 items-center w-[25vw] gap-4">
                  <CardHeader className="p-0">
                    <Image
                      src="/profile.svg"
                      alt="profile svg icon"
                      className="border-4 border-black rounded-full"
                      width={64}
                      height={64}
                    />
                  </CardHeader>
                  <CardContent className="grow p-0 flex flex-col justify-center h-3/5 text-left">
                    <h3 className="capitalize items-center md:text-xl">
                      {resident.resident_name}
                    </h3>
                  </CardContent>
                  <CardFooter className="p-2">
                    <DeleteResident
                      {...{
                        resident_id: resident.resident_id,
                        deleteResidentData,
                      }}
                    />
                  </CardFooter>
                </Card>
              </Link>
            ))}
        </div>
      </section>
      <section className="mb-8 flex flex-col md:flex-row md:justify-center md:flex-wrap gap-6 w-full md:w-4/5 lg:w-2/3 mx-auto">
        <div className="flex gap-5 flex-wrap items-center justify-center md:w-2/3">
          <Button
            className="sm:w-64 w-full"
            onMouseDown={() =>
              router.push(`/admin/residents/${roomData.id}/add`)
            }
          >
            Add New Resident
          </Button>
        </div>
      </section>
    </main>
  );
}
