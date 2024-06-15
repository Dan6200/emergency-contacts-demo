import { onAuthStateChanged } from "@/firebase/auth";
import { firebaseConfig } from "@/firebase/config";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useUserSession(initialUser: User | null) {
  // The initial user comes from the server via a server component
  const [user, setUser] = useState(initialUser);
  console.log("user session hook", user);
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();

  // Register  the service worker that sends auth state back to server
  // The service worker is built with npm run build-service-worker
  /*
	 * auth-service-worker.(ts|js) has errors
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
	*/

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
      // refresh when user changed to ease testing
      if (user?.email !== authUser?.email) {
        router.refresh();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return [user, userLoaded];
}
