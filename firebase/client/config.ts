import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
export default db;
