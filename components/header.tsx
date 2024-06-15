"use client";
import React, { MouseEventHandler, MouseEvent } from "react";
import Link from "next/link";
import { signOut } from "@/firebase/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Plus, Search, UserRound, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import userAtom from "@/atoms/user";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useAtom(userAtom);

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    setUser(null);
    return signOut();
  };

  return (
    <header className="fixed w-full bg-background/80 flex border-b items-center justify-between px-4 py-2">
      <Link href="/">
        <Image
          width={100}
          height={100}
          src="/client-logo-small.png"
          alt="LinkId logo"
          className="md:hidden"
        />
        <Image
          width={150}
          height={150}
          src="/client-logo-large.jpeg"
          alt="LinkId logo"
          className="hidden md:block"
        />
      </Link>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full border-primary border-4 bg-primary-foreground w-12 h-12">
            <UserRound className="mx-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="text-center gap-5 p-2 md:gap-5 bg-background border-2 mr-4">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <span
                  onClick={() => router.push("/admin/residents")}
                  className="cursor-pointer h-9 items-center flex justify-between mx-auto w-48"
                >
                  Search Residents
                  <Search className="w-4 mr-2" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span
                  onClick={() => router.push("/admin/add-residents")}
                  className="cursor-pointer h-9 items-center flex justify-between mx-auto w-full"
                >
                  Add New Residents
                  <Plus className="w-4 mr-2" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span
                  onClick={() => router.push("/admin/new")}
                  className="cursor-pointer h-9 items-center flex justify-between mx-auto w-full"
                >
                  Add New Admin
                  <UserRoundPlus className="w-6" />
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button onClick={handleSignOut} className="w-full mx-auto">
                  Sign Out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/admin/sign-in" className="">
          <Button className="capitalize hidden md:flex">
            sign in as admin
          </Button>
          <Button className="capitalize md:hidden">sign in</Button>
        </Link>
      )}
    </header>
  );
}
