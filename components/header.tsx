"use client";
import React, {
  useState,
  useEffect,
  MouseEventHandler,
  MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { signOut, signInWithGoogle, onAuthStateChanged } from "@/firebase/auth";
import { firebaseConfig } from "@/firebase/config";
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
import { useAtomValue } from "jotai";
import { UserAtom } from "@/app/atoms/user";

function useUserSession(initialUser: User | null) {
  // The initial user comes from the server via a server component
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  // Register  the service worker that sends auth state back to server
  // The service worker is built with npm run build-service-worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const serializedFirebaseConfig = encodeURIComponent(
        JSON.stringify(firebaseConfig)
      );
      const serviceWorkerUrl = `/auth-service-worker.js?firebaseConfig=${serializedFirebaseConfig}`;
      navigator.serviceWorker
        .register(serviceWorkerUrl)
        .then((registration) => console.log("scope is: ", registration.scope));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      if (user === undefined) return;
      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return user;
}

export default function Header() {
  const initialUser = useAtomValue(UserAtom);
  const user = useUserSession(initialUser);

  const handleSignOut: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    const resolved = await signOut();
    console.log("sign out", resolved);
  };

  const handleSignIn: MouseEventHandler<HTMLButtonElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    const resolved = await signInWithGoogle();
    console.log(resolved);
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

          <DropdownMenuContent className="text-center gap-2 md:gap-5 bg-background border-2 mr-4">
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/manage-residents" className="mx-auto">
                Manage Residents Information
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
