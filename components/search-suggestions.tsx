import { Card, CardContent } from "@/components/ui/card";
import type { Resident } from "@/components/resident";
import Link from "next/link";

export const SearchSuggestions = ({ residents }: { residents: Resident[] }) => (
  <Card className="mt-8">
    <CardContent className="p-4 overflow-x-hidden flex flex-col gap-2">
      {residents.map((resident) => (
        <Link
          className="w-9/10 overflow-scroll text-nowrap h-10"
          href={`/resident/${resident.id}`}
        >
          {resident.name} | {resident.unit_number} | {resident.address}
        </Link>
      ))}
    </CardContent>
  </Card>
);
