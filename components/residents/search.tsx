"use client";
import { SearchBar } from "@/components/search-bar";
import { useLayoutEffect, useState } from "react";
import type { Resident } from "@/types/resident";
import { SearchSuggestions } from "../search-suggestions";
import { useUserSession } from "@/auth/user";
import { redirect } from "next/navigation";

interface SearchProps {
  residents: Resident[];
}

export default function Search({ residents }: SearchProps) {
  const [matchingResidents, setMatchingResidents] = useState<null | Resident[]>(
    null
  );
  const user = useUserSession(null);
  const [canRedirect, setCanRedirect] = useState(false);
  const [open, setOpen] = useState(true);
  useLayoutEffect(() => {
    let t: any;
    if (!user && canRedirect) {
      redirect("/");
    }
    t = setTimeout(() => {
      setCanRedirect(true);
    }, 1000);
    return () => t;
  }, [user]);

  return (
    <main className="bg-background w-full px-4 mx-auto py-8 max-h-screen">
      <SearchBar {...{ residents, setMatchingResidents, setOpen }} />
      {matchingResidents && open && (
        <SearchSuggestions {...{ matchingResidents, setOpen }} />
      )}
    </main>
  );
}
