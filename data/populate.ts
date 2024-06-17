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
dotenv.config({ path: ".env.local" });

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
  setConnectTimeout: 10000,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

console.log(firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

let file1 = "data/emergency-contacts.csv",
  file2 = "data/residents.csv";

createReadStream(file2)
  .pipe(fastcsv.parse({ headers: true }))
  .on("data", async (row) => {
    try {
      const colRef = await collectionWrapper(db, "residents").catch((e) => {
        throw new Error("Unable to retrieve collection reference\n\t" + e);
      });
      const { address, unit_number, name } = row;
      const docRef = await addDocWrapper(colRef, {
        name,
        address,
        unit_number,
      }).catch((e) => {
        throw new Error("Unable to add data to document\n\t" + e);
      });
      console.log("Resident Id: ", docRef.id);
    } catch (err) {
      throw new Error("Unable to add residents to database.\n\t" + err);
    }
  })
  .on("error", (error: Error) => console.error(`Encounter an error:\n${error}`))
  .on("end", (rowCount: number) => console.log(`Parsed ${rowCount}  rows`));

setTimeout(() => {
  createReadStream(file1)
    .pipe(fastcsv.parse({ headers: true }))
    .on("data", async (row) => {
      try {
        const ecColRef = await collectionWrapper(db, "emergency_contacts");
        if (!isTypeEmergencyContact(row)) {
          console.dir(row);
          throw new Error("row is not of type Emergency Contact");
        }
        const { relationship, phone_number, emergency_contact: name } = row;
        const ecDocRef = await addDocWrapper(ecColRef, {
          name,
          relationship,
          phone_number,
        });
        console.log("Emergency contact Id: ", ecDocRef.id);
        const resColRef = await collectionWrapper(db, "residents").catch(
          (err) => {
            throw new Error(err);
          }
        );
        const q = query(
          resColRef,
          where("name", "==", row.residents),
          where("address", "==", row.addresses),
          where("unit_number", "==", row.unit_number)
        );
        const querySnapshot = await getDocsWrapper(q);
        Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const docData = doc.data();
            if (!docData)
              throw new Error("No residents found matching query -- Tag:26");
            if (!isTypeResidents(docData))
              throw new Error("Object is not of type resident -- Tag:25");
            await updateDocWrapper(doc.ref, {
              emergency_contact_ids: [
                ...(docData.emergency_contact_ids ?? []),
                ecDocRef.id,
              ],
            });
          })
        );
      } catch (err) {
        throw new Error(
          "Unable to add Emergency Contact Information to Resident Data.\n\t" +
            err
        );
      }
    })
    .on("error", (error: Error) =>
      console.error(`Encounter an error:\n${error}`)
    )
    .on("end", (rowCount: number) => console.log(`Parsed ${rowCount}  rows`));
}, 6000);

interface Residents {
  name: string;
  address: string;
  unit_number: string;
  emergency_contact_ids?: string[];
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
