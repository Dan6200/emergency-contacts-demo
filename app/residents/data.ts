import db from "@/firebase/config";
import {
  collectionWrapper,
  docWrapper,
  getDocsWrapper,
  getDocWrapper,
  queryWrapper,
} from "@/firebase/firestore";
import {
  EmergencyContact,
  isTypeEmergencyContact,
  isTypeResident,
  Resident,
} from "@/types/resident";
import { query } from "firebase/firestore";
import { isError } from "../utils";

export async function getAllResidentsData() {
  const collectionResponse = collectionWrapper(db, "residents");
  if (isError(collectionResponse))
    return new Error("Could not access database:\n", collectionResponse);
  const residentsCollection = collectionResponse;
  const q = queryWrapper(residentsCollection);
  if (isError(q)) return new Error("Could not get query object:\n", q);
  const residentsData = await getDocsWrapper(q);
  if (isError(residentsData) || residentsData === undefined)
    throw new Error("Could not fetch data");

  const residents: Resident[] = [];

  for (const doc of residentsData.docs) {
    let resident = doc.data();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident");
    const emContactData: EmergencyContact[] = [];
    for (const emContactId of resident.emergency_contact_id) {
      const emContactsDoc = docWrapper(db, "emergency-contacts", emContactId);
      if (isError(emContactsDoc))
        return new Error(
          "Could not retrieve the Emergency Contacts Document:\n",
          emContactsDoc
        );
      const emContactsSnap = await getDocWrapper(emContactsDoc).catch((err) => {
        throw new Error("Could access Emergency Contacts Snapshot:\n", err);
      });
      const singleEmConData = emContactsSnap.data();
      if (!isTypeEmergencyContact(singleEmConData))
        throw new Error("Object is not of type Emergency Contact:\n");
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
  return residents;
}
