"use client";
import { useEffect, useState } from "react";
import { Suggestions } from "@/components/header/search/suggestions";
import { redirect } from "next/navigation";
import { useAtomValue } from "jotai";
import userAtom from "@/atoms/user";
import { Residence } from "@/types/resident";
import { SearchBar } from "./search-bar";
import { cn } from "@/lib/utils";

interface SearchProps {
  rooms: (Residence & { id: string })[];
  className: string;
}

export default function Search({ rooms, className }: SearchProps) {
  const [matchingRooms, setMatchingRooms] = useState<
    null | (Residence & { id: string })[]
  >(null);
  const admin = useAtomValue(userAtom);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      if (!admin) {
        redirect("/");
      }
    }, 500);
  }, [admin]);

  return (
    <div className={cn("", className)}>
      <SearchBar {...{ rooms, setMatchingRooms, setOpen }} />
      {matchingRooms && open && <Suggestions {...{ matchingRooms, setOpen }} />}
    </div>
  );
}
