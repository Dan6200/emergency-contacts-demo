import Resident from "@/components/resident";
import type { Resident as ResidentType } from "@/types/resident";
import db from "@/firebase/config";
import {
  collectionWrapper,
  docWrapper,
  getDocsWrapper,
  getDocWrapper,
} from "@/firebase/firestore";
import { isTypeEmergencyContact, isTypeResident } from "@/types/resident";

export default async function ResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [resDocErr, resDocRef] = docWrapper(db, "residents", id);
  if (resDocErr || !resDocRef) throw new Error(resDocErr!);
  const [resSnapErr, resDocSnap] = await getDocWrapper(resDocRef);
  if (resSnapErr || !resDocSnap) throw new Error(resSnapErr!);
  const resData = resDocSnap.data();
  if (!isTypeResident(resData))
    throw new Error("Object is not of type Resident");
  const emContactData = [];
  for (const emContactId of resData.emergency_contact_id) {
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
  const resident: ResidentType = {
    ...resData,
    emergency_contacts: emContactData,
  };
  return <Resident {...{ resident }} />;
}

export async function generateStaticParams() {
  const [colError, colRef] = collectionWrapper(db, "residents");
  if (colError || !colRef) throw new Error(colError!);
  const [qErr, qSnapshot] = await getDocsWrapper(colRef);
  if (qErr || !qSnapshot) throw new Error(qErr!);
  return qSnapshot.docs.map((doc) => doc.id);
}
