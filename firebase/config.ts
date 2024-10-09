import "server-only";
import {
  browserLocalPersistence,
  setPersistence,
  getAuth,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  appId: process.env.APP_ID,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const auth = getAuth(app);
await setPersistence(auth, browserLocalPersistence);
export default db;
