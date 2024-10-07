"use client";
import { useEffect, useState } from "react";
import { Suggestions } from "@/components/header/search/suggestions";
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
    <div className="flex-1">
      <SearchBar {...{ residents, setMatchingResidents, setOpen }} />
      {matchingResidents && open && (
        <Suggestions {...{ matchingResidents, setOpen }} />
      )}
    </div>
  );
}
