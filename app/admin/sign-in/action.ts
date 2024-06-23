"use server";
import {
  signInWithEmailAndPasswordWrapper,
  signOutWrapper,
} from "@/firebase/auth";

export async function signOut() {
  signOutWrapper();
}

export async function signIn(data: { email: string; password: string }) {
  return signInWithEmailAndPasswordWrapper(data.email, data.password)
    .then(({ user }) => ({
      result: JSON.stringify(user),
      success: true,
      message: "User Signed In Successfully",
    }))
    .catch((error) => {
      return {
        result: error.message,
        message: "Failed to Sign In User.",
        success: false,
      };
    });
}
