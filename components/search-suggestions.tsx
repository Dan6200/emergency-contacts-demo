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
    <Card className="mt-8 py-4">
      <div className="max-h-[40vh] w-[90%] relative mx-auto overflow-scroll">
        <span
          onClick={() => setOpen(!open)}
          className="absolute top-0 right-0 border rounded-sm border-1"
        >
          <X />
        </span>
        <CardContent className="mt-8 py-4 px-0 flex flex-col gap-2">
          {residents.length ? (
            residents.map((resident) => (
              <Link
                className="hover:bg-primary/10 bg-muted rounded-md p-2 text-nowrap h-9 align-bottom"
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
