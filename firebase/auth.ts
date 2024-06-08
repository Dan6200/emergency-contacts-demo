import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  UserCredential,
  Auth,
} from "firebase/auth";
import { auth } from "./config";

export function onAuthStateChanged(cb: (authUser: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithEmailAndPasswordWrapper(
  email: string,
  password: string
): Promise<[string | null, UserCredential | null]> {
  let res = null,
    error = null;
  try {
    res = await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    error = "Failed to sign in: " + e;
  } finally {
    return [error, res];
  }
}

export async function signInWithGoogle() {
  let provider = new GoogleAuthProvider(),
    result = null,
    error = null;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (e) {
    error = "Error signing in with Google: " + e;
  } finally {
    return { result, error };
  }
}

// createUserWithEmailAndPassword(auth, email, password);

export async function signOut() {
  let error = null;
  try {
    await auth.signOut();
  } catch (e) {
    error = "Error signing out with Google: " + e;
  } finally {
    return error;
  }
}
