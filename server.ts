import "server-only";
import { auth } from "./firebase/config";

export async function getAuthenticatedAppForUser() {
  await auth.authStateReady();
  return { currentUser: auth.currentUser };
}
