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

  const handleSignOut: MouseEventHandler<HTMLAnchorElement> = async (
    event: MouseEvent
  ) => {
    event.preventDefault();
    const resolved = await signOut();
    console.log("sign out", resolved);
  };

  const handleSignIn: MouseEventHandler<HTMLAnchorElement> = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    const resolved = await signInWithGoogle();
    console.log(resolved);
  };

  return (
    <header className="flex justify-between px-8 py-2">
      <Link href="/" className="logo">
        <Image
          width={150}
          height={150}
          src="/client-logo-large.jpeg"
          alt="LinkId logo"
        />
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>{user.displayName}</p>

            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            Sign In
          </a>
        </div>
      )}
    </header>
  );
}
