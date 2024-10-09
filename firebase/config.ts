import "server-only";
import {
  browserLocalPersistence,
  setPersistence,
  getAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_BKUP,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN_BKUP,
  projectId: process.env.FIREBASE_PROJECT_ID_BKUP,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_BKUP,
  appId: process.env.FIREBASE_APP_ID_BKUP,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_BKUP,
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
export default db;
