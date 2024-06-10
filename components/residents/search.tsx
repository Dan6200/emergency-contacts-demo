"use client";
import { SearchBar } from "@/components/search-bar";
import { useLayoutEffect, useState } from "react";
import type { Resident } from "@/types/resident";
import { SearchSuggestions } from "../search-suggestions";
import { useUserSession } from "@/auth/user";
import { User } from "firebase/auth";
import { redirect } from "next/navigation";

export default function Search({ initialUser }: { initialUser: User | null }) {
  const [residents, setResidents] = useState<null | Resident[]>(null);
  const user = useUserSession(initialUser);
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
      <SearchBar {...{ setResidents, setOpen }} />
      {residents && open && <SearchSuggestions {...{ residents, setOpen }} />}
    </main>
  );
}
