import {
  EmailAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export function onAuthStateChanged(cb: (authUser: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithEmail() {
  let provider = new EmailAuthProvider(),
    result = null,
    error = null;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (e) {
    error = "Error signing in with Email: " + error;
  } finally {
    return { result, error };
  }
}

export async function signOut() {
  let error = null;
  try {
    await auth.signOut();
  } catch (e) {
    error = "Error signing out with Email: " + error;
  } finally {
    return error;
  }
}
