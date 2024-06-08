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

export default function Header({ initialUser }: { initialUser: User }) {
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
    <header className="bg-gradient-to-r from-background to-primary flex justify-between px-8 py-2">
      <Link href="/" className="logo">
        <Image
          width={150}
          height={150}
          src="/client-logo-large.jpeg"
          alt="LinkId logo"
        />
      </Link>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full border-2 bg-primary-foreground w-12 h-12">
            <UserRound className="mx-auto" />
          </DropdownMenuTrigger>

          <DropdownMenuContent className="bg-background border-2">
            <DropdownMenuLabel>
              Welcome, {/* first name only */}
              {user.displayName?.split(" ")[0]}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button onClick={handleSignOut}>Sign Out</Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="profile">
          <Button onClick={handleSignIn}>Sign In</Button>
        </div>
      )}
    </header>
  );
}
