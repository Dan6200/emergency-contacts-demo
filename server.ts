import "server-only";
import { auth } from "./firebase/config";

export async function getAuthenticatedAppForUser() {
  await auth.authStateReady();
  console.dir(auth);
  return { currentUser: auth.currentUser };
}
