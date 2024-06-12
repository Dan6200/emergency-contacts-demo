import {
  signInWithEmailAndPassword,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export function onAuthStateChanged(cb: (authUser: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithEmailAndPasswordWrapper(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email, password).catch((e) => {
    throw new Error("Failed to sign in.\n\t" + e);
  });
}

export async function signInWithGoogle() {}

// createUserWithEmailAndPassword(auth, email, password);

export async function signOut() {
  return auth.signOut().catch(function (e) {
    throw new Error("Error signing out with Google: " + e);
  });
}
