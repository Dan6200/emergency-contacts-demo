import { Card, CardContent } from "@/components/ui/card";
import type { Residence } from "@/types/resident";
import Link from "next/link";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export const Suggestions = ({
  matchingRooms,
  setOpen,
}: {
  matchingRooms: (Residence & { id: string })[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Card className="absolute mt-4 py-0 w-full md:w-2/5 md:left-1/3 left-0">
      <div className="w-11/12 relative mx-auto ">
        <span
          onClick={() => setOpen(!open)}
          className="bg-foreground absolute top-0 right-0 rounded-md"
        >
          <X className="text-background" />
        </span>
        <CardContent className="my-4 px-0 flex flex-col overflow-y-scroll max-h-[80vh] md:max-h-[40vh] gap-2">
          {matchingRooms.length ? (
            matchingRooms.map((room) => (
              <Link
                className="text-left cursor-pointer active:bg-primary/10 hover:bg-primary/10 bg-muted w-full rounded-md p-2 text-nowrap align-bottom"
                href={`/room/${room.id}`}
                key={room.id}
              >
                <p className="font-semibold">{room.residence_id}</p>
                <p>{room.address}</p>
                <p className="text-sm font-semibold">Rm: {room.roomNo}</p>
              </Link>
            ))
          ) : (
            <div className="text-left text-muted-foreground">
              Resident Not Found
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};
