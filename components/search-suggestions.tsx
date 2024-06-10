import { Card, CardContent } from "@/components/ui/card";
import type { Resident } from "@/types/resident";
import Link from "next/link";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export const SearchSuggestions = ({
  residents,
  setOpen,
}: {
  residents: Resident[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Card className="mt-8 py-0">
      <div className="w-[90%] relative mx-auto ">
        <span onClick={() => setOpen(!open)} className="absolute top-0 right-0">
          <X />
        </span>
        <CardContent className="my-4 pt-10 px-0 flex flex-col overflow-scroll max-h-[40vh] gap-2">
          {residents.length ? (
            residents.map((resident) => (
              <Link
                className="active:hover:bg-primary/10 bg-muted w-fit rounded-md p-2 text-nowrap h-9 align-bottom"
                href={`/residents/${resident.id}`}
                key={resident.id}
              >
                {resident.name} | {resident.unit_number} | {resident.address}
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
