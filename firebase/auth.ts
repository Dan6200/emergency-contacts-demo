"use server";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged as _onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export async function onAuthStateChanged(cb: (authUser: User | null) => void) {
  return _onAuthStateChanged(auth, cb);
}

export async function createUserWithEmailAndPasswordWrapper(
  email: string,
  password: string
) {
  return createUserWithEmailAndPassword(auth, email, password).catch((e) => {
    throw new Error("Failed to Create User. -- Tag:3\n\t" + e);
  });
}

export async function signInWithEmailAndPasswordWrapper(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email, password).catch((e) => {
    throw new Error("Failed to sign in -- Tag:2\n\t" + e);
  });
}

export async function signOutWrapper() {
  auth.signOut().catch(function (e) {
    throw new Error("Error signing out -- Tag:27\n\t" + e);
  });
}
