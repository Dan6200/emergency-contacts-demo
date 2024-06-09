import "server-only";
import { initializeServerApp } from "firebase/app";
import { headers } from "next/headers";
import { firebaseConfig } from "./firebase/config";
import { getAuth } from "firebase/auth";

export async function getAuthenticatedAppForUser() {
  const idToken = headers().get("Authorization")?.split("Bearer ")[1];
  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    idToken ? { authIdToken: idToken } : {}
  );

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();
  return { firebaseServerApp, currentUser: auth.currentUser };
}
