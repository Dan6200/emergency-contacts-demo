import { Card, CardContent } from "@/components/ui/card";
import type { Resident } from "@/components/resident";
import Link from "next/link";

export const SearchSuggestions = ({ residents }: { residents: Resident[] }) => (
  <Card className="mt-8 py-4">
    <div className="max-h-[40vh] w-[90%] mx-auto overflow-scroll">
      <CardContent className="py-4 px-0 flex flex-col gap-2">
        {residents.length ? (
          residents.map((resident) => (
            <Link
              className="text-nowrap h-9 align-bottom"
              href={`/resident/${resident.id}`}
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
