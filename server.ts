import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { headers } from "next/headers";
import "server-only";
import { firebaseConfig } from "./firebase/config";

export async function getAuthenticatedAppForUser() {
  const idToken = headers().get("Authorization")?.split("Bearer ")[1];
  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    idToken
      ? {
          authIdToken: idToken,
        }
      : {}
  );
  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();
  return { firebaseServerApp, currentUser: auth.currentUser };
}
