"use client";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import type { Resident } from "@/components/resident";
import { SearchSuggestions } from "../search-suggestions";

export default function Search() {
  const [residents, setResidents] = useState<null | Resident[]>(null);
  const [open, setOpen] = useState(true);
  return (
    <main className="bg-background w-full px-4 mx-auto py-8 max-h-screen">
      <SearchBar {...{ setResidents, setOpen }} />
      {residents && open && <SearchSuggestions {...{ residents, setOpen }} />}
    </main>
  );
}
