export {};
/*
import { createReadStream } from "fs";
import * as fastcsv from "fast-csv";
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
dotenv.config({ path: "../.env.local" });

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
  setConnectTimeout: 10000,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

let file = "emergency-contacts.csv";

(async () => {
  const  = collectionWrapper(db, "residents");
  if (ref === null)
    throw new Error("could not get residents collection reference: " + error);
  const [docErr, snapshot] = await getDocsWrapper(ref as Query);
  if (snapshot === null)
    throw new Error("Could not retrieve docs snapshot: " + docErr);
  Promise.all(
    snapshot.docs.map(async (doc) => {
      const updateErr = await updateDocWrapper(doc.ref, {
        emergency_contact_id: [],
      });
      if (updateErr)
        throw new Error("could not update residents document: " + updateErr);
    })
  );
})();

createReadStream(file)
  .pipe(fastcsv.parse({ headers: true }))
  .on("data", async (row) => {
    const [ecError, ecRef] = collectionWrapper(db, "emergency-contacts");
    if (ecRef === null) throw new Error(<string>ecError);
    if (!isTypeEmergencyContact(row)) {
      console.dir(row);
      throw new Error("row is not of type Emergency Contact");
    }
    const { relationship, phone_number, emergency_contact: name } = row;
    const [ecDocErr, ecResult] = await addDocWrapper(ecRef, {
      name,
      relationship,
      phone_number,
    });
    if (ecResult == null) throw new Error(ecDocErr!);
    const [resErr, resRef] = collectionWrapper(db, "residents");
    if (resRef === null) throw new Error(resErr!);
    const q = query(
      resRef,
      where("name", "==", row.residents),
      where("address", "==", row.addresses),
      where("unit_number", "==", row.unit_number)
    );
    const [qError, querySnapshot] = await getDocsWrapper(q);
    if (querySnapshot == null) throw new Error(qError!);
    Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const docData = doc.data();
        if (isTypeResidents(docData)) {
          const updateErr = await updateDocWrapper(doc.ref, {
            emergency_contact_id: [
              ...(docData.emergency_contact_id ?? []),
              ecResult.id,
            ],
          });
          if (updateErr) throw new Error(updateErr);
        } else throw new Error("Data is not resident document");
      })
    );
  })
  .on("error", (error: Error) => console.error(`Encounter an error:\n${error}`))
  .on("end", (rowCount: number) => console.log(`Parsed ${rowCount}  rows`));

interface Residents {
  name: string;
  address: string;
  unit_number: string;
  emergency_contact_id?: string[];
}

interface EmergencyContact {
  residents: string;
  addresses: string;
  unit_number: string;
  relationship: string;
  emergency_contact: string;
  phone_number: string;
}

const isTypeResidents = (data: any): data is Residents =>
  "name" in data && "address" in data && "unit_number" in data;

const isTypeEmergencyContact = (data: any): data is EmergencyContact =>
  "emergency_contact" in data &&
  "relationship" in data &&
  "phone_number" in data &&
  "residents" in data &&
  "addresses" in data &&
  "unit_number" in data;
	*/
