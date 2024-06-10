import db from "@/firebase/config";
import {
  collectionWrapper,
  docWrapper,
  getDocsWrapper,
  getDocWrapper,
} from "@/firebase/firestore";
import {
  EmergencyContact,
  isTypeEmergencyContact,
  isTypeResident,
  Resident,
} from "@/types/resident";
import { query } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  const [resErr, resRef] = collectionWrapper(db, "residents");
  if (resRef === null) throw new Error("could not access database");
  const q = query(resRef);
  const [err, resData] = await getDocsWrapper(q);
  if (resData === null) throw new Error("Could not fetch data");

  const residents: Resident[] = [];

  for (const doc of resData.docs) {
    let resident = doc.data();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident");
    const emContactData: EmergencyContact[] = [];
    for (const emContactId of resident.emergency_contact_id) {
      const [emDocErr, emDocRef] = docWrapper(
        db,
        "emergency-contacts",
        emContactId
      );
      if (emDocErr || !emDocRef) throw new Error(emDocErr!);
      const [emSnapErr, emDocSnap] = await getDocWrapper(emDocRef);
      if (emSnapErr || !emDocSnap) throw new Error(emSnapErr!);
      const singleEmConData = emDocSnap.data();
      if (!isTypeEmergencyContact(singleEmConData))
        throw new Error("Object is not of type Emergency Contact");
      emContactData.push(singleEmConData);
    }
    resident = {
      ...resident,
      id: doc.id,
      emergency_contacts: emContactData,
    };
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident");
    residents.push(resident);
  }

  return NextResponse.json(residents);
}
