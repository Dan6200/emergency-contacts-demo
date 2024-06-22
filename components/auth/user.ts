import { onAuthStateChanged } from "@/firebase/auth";
import { firebaseConfig } from "@/firebase/config";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useUserSession(initialUser?: object | User) {
  // The initial user comes from the server via a server component
  const [user, setUser] = useState<object | User | null>(initialUser ?? null);
  const [userLoaded, setUserLoaded] = useState(false);
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
      setUserLoaded(true);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onAuthStateChanged((authUser) => {
      if (user === undefined) return;
      if ((<User>user)?.email !== authUser?.email) {
        router.refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return [user, userLoaded];
}
