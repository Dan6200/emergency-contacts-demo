import "server-only";
import { onAuthStateChanged } from "./actions";

onAuthStateChanged((admin) => {
  if (admin) console.log("admin user signed in: " + admin.email);
  else console.log("admin user signed out");
});
