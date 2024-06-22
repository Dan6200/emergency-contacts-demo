"use server";
import { signInWithEmailAndPasswordWrapper } from "@/firebase/auth";

export async function signIn(data: { email: string; password: string }) {
  return signInWithEmailAndPasswordWrapper(data.email, data.password)
    .then((userCred) => ({
      result: JSON.stringify(userCred),
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
