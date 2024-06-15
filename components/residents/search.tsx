"use client";
import { SearchBar } from "@/components/search-bar";
import { useLayoutEffect, useState } from "react";
import type { Resident } from "@/types/resident";
import { SearchSuggestions } from "../search-suggestions";
import { useUserSession } from "@/auth/user";
import { redirect } from "next/navigation";
import { useAtomValue } from "jotai";
import userAtom from "@/atoms/user";

interface SearchProps {
  residents: Resident[];
}

export default function Search({ residents }: SearchProps) {
  const [matchingResidents, setMatchingResidents] = useState<null | Resident[]>(
    null
  );
  const admin = useAtomValue(userAtom);
  const [open, setOpen] = useState(true);

  useLayoutEffect(() => {
    if (!admin) {
      redirect("/");
    }
  }, [admin]);

  return (
    <main className="w-full sm:w-4/5 md:w-3/5 px-[5vw] sm:px-8 mx-auto py-8 max-h-screen">
      <SearchBar {...{ residents, setMatchingResidents, setOpen }} />
      {matchingResidents && open && (
        <SearchSuggestions {...{ matchingResidents, setOpen }} />
      )}
    </main>
  );
}
