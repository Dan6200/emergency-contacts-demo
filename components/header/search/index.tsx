"use client";
import { useEffect, useState } from "react";
import { SearchSuggestions } from "@/components/search-suggestions";
import { redirect } from "next/navigation";
import { useAtomValue } from "jotai";
import userAtom from "@/atoms/user";
import { Resident } from "@/types/resident";
import { SearchBar } from "./search-bar";

interface SearchProps {
  residents: Resident[];
}

export default function Search({ residents }: SearchProps) {
  const [matchingResidents, setMatchingResidents] = useState<null | Resident[]>(
    null
  );
  const admin = useAtomValue(userAtom);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (!admin) {
        redirect("/");
      }
    }, 500);
  }, [admin]);

  return (
    <main className="w-full sm:w-4/5 md:w-3/5 px-[5vw] sm:px-8 mx-auto py-8">
      <SearchBar {...{ residents, setMatchingResidents, setOpen }} />
      {matchingResidents && open && (
        <SearchSuggestions {...{ matchingResidents, setOpen }} />
      )}
    </main>
  );
}
