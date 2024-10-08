import { readFile } from "fs/promises";
import {
  addDocWrapper,
  collectionWrapper,
  getDocsWrapper,
  updateDocWrapper,
} from "@/firebase/firestore";
import {
  CollectionReference,
  initializeFirestore,
  Query,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY_BKUP,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN_BKUP,
  projectId: process.env.FIREBASE_PROJECT_ID_BKUP,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET_BKUP,
  appId: process.env.FIREBASE_APP_ID_BKUP,
  setConnectTimeout: 100000,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID_BKUP,
};

console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

let file1 = "data/emergency-contacts.json";
let file3 = "data/residence.json";

interface Resident {
  resident_id: string;
  residence_id: string;
  resident_name: string | null;
}

interface EmergencyContact {
  residence_id: string;
  resident_id: string;
  contact_name: string | null;
  cell_phone: string | null;
  work_phone: string | null;
  home_phone: string | null;
  relationship: string | null;
}

interface Residence {
  residence_id: string;
  roomNo: string;
  address: string;
}

const emergencyContacts = JSON.parse(await readFile(file1, "utf8"));
//const residents = JSON.parse(await readFile(file2, "utf8"));
const residences = JSON.parse(await readFile(file3, "utf8"));

//const residentsPromise = residents.map(async (resident: Resident) => {
//  const residentColRef = await collectionWrapper(db, "residents");
//  await addDocWrapper(residentColRef, resident).catch((error) => {
//    console.log({
//      success: false,
//      message: "Failed to Add a New Resident: " + error.toString(),
//    });
//  });
//});
//
const residencePromise = residences.map(async (residence: Residence) => {
  const residenceColRef = await collectionWrapper(db, "residence");
  await addDocWrapper(residenceColRef, residence).catch((error) => {
    console.log({
      success: false,
      message: "Failed to Add Place Of Residence: " + error.toString(),
    });
  });
});

const contactPromise = emergencyContacts.map(
  async (contact: EmergencyContact) => {
    const contactColRef = await collectionWrapper(db, "emergency_contacts");
    await addDocWrapper(contactColRef, contact).catch((error) => {
      console.log({
        success: false,
        message: "Failed to Add Place Of Residence: " + error.toString(),
      });
    });
  }
);

await Promise.all([contactPromise]);
