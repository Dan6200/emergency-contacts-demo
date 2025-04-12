"use client";
import { useState } from "react";
import { Suggestions } from "@/components/header/search/suggestions";
import { Residence } from "@/types/residence";
import { SearchBar } from "./search-bar";
import { cn } from "@/lib/utils";

interface SearchProps {
  rooms: (Residence & { document_id: string })[];
  className: string;
}

export default function Search({ rooms, className }: SearchProps) {
  const [matchingRooms, setMatchingRooms] = useState<
    null | (Residence & { document_id: string })[]
  >(null);
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("", className)}>
      <SearchBar {...{ rooms, matchingRooms, setMatchingRooms, setOpen }} />
      {matchingRooms && open && <Suggestions {...{ matchingRooms, setOpen }} />}
    </div>
  );
}
