"use client";
import React, { MouseEventHandler, MouseEvent } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { signOut, signInWithGoogle } from "@/firebase/auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserRound } from "lucide-react";
import { useUserSession } from "@/auth/user";

export default function Header({ initialUser }: { initialUser: User | null }) {
  const user = useUserSession(initialUser);

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    const resolved = await signOut();
  };

  const handleSignIn: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    signInWithGoogle();
  };

  return (
    <header className="flex border-b items-center justify-between px-4 py-2">
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
          <DropdownMenuTrigger className="rounded-full border-primary/80 border-4 bg-primary-foreground w-12 h-12">
            <UserRound className="mx-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="text-center gap-5 p-2 md:gap-5 bg-background border-2 mr-4">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                href="/admin/residents/search"
                className="h-9 align-middle mx-auto w-48"
              >
                Search Residents
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href="/admin/residents/add"
                className="h-9 align-middle mx-auto w-full"
              >
                Add New Residents
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button onClick={handleSignOut} className="w-full mx-auto">
                Sign Out
              </Button>
            </DropdownMenuItem>
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
