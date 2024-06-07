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
import { signOut, signInWithEmail, onAuthStateChanged } from "@/firebase/auth";
import { firebaseConfig } from "@/firebase/config";

function useUserSession(initialUser?: User) {
  // The initial user comes from the server via a server component
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  // Register  the service worker that sends auth state back to server
  // The serviece worker is built with npm run build-service-worker
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
      if (authUser !== null) setUser(authUser);
    });
    return () => unsubscribe();
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

export default function Header({ initialUser }: { initialUser?: User }) {
  const user = useUserSession(initialUser);

  const handleSignOut: MouseEventHandler<HTMLAnchorElement> = (
    event: MouseEvent
  ) => {
    event.preventDefault();
    signOut();
  };

  const handleSignIn: MouseEventHandler<HTMLAnchorElement> = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    signInWithEmail();
  };

  return (
    <header>
      <Link href="/" className="logo">
        <img src="/logo.svg" alt="LinkId logo" />
        Logo
      </Link>
      {user ? (
        <>
          <div className="profile">
            <p>
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email!}
              />
              {user.displayName}
            </p>

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
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
