import { Residence } from "@/types/resident";
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Firestore,
  DocumentData,
  initializeFirestore,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
  setConnectTimeout: 100000,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Function to rename fields in a Firestore document
export async function batchUpdateFieldNames(
  db: Firestore,
  collectionName: string
) {
  try {
    // Step 1: Get all documents in the collection
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    // Step 2: Initialize a batch
    const batch = writeBatch(db);

    snapshot.forEach((document) => {
      const docRef = doc(db, collectionName, document.id);
      const data = <Residence & { room: string }>document.data();

      // Step 3: Rename fields
      const updatedData: Residence & { room?: string } = {
        ...data,
        roomNo: data.room, // Rename the field
        room: undefined,
      };
      delete updatedData.room; // Remove the old field

      // Step 4: Update the document in the batch
      batch.update(docRef, <DocumentData>updatedData);
    });

    // Step 5: Commit the batch
    await batch.commit();
    console.log("Batch update completed.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
}

batchUpdateFieldNames(db, "residence");
