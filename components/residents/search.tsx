"use client";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import type { Resident } from "@/components/resident";
import { SearchSuggestions } from "../search-suggestions";

export default function Search() {
  const [residents, setResidents] = useState<null | Resident[]>(null);
  return (
    <main className="bg-background w-full px-4 mx-auto py-8 max-h-screen">
      <SearchBar {...{ setResidents }} />
      {residents && residents.length > 0 && (
        <SearchSuggestions {...{ residents }} />
      )}
    </main>
  );
}
