import "server-only";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config";

onAuthStateChanged(auth, (admin) => {
  if (admin) console.log("user signed in: " + admin.email);
  else console.log("user signed out");
});
