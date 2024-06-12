import db from "@/firebase/config";
import {
  addDocWrapper,
  collectionWrapper,
  docWrapper,
  getDocsWrapper,
  getDocWrapper,
  queryWrapper,
  updateDocWrapper,
} from "@/firebase/firestore";
import {
  EmergencyContact,
  isTypeEmergencyContact,
  isTypeResident,
  Resident,
} from "@/types/resident";

export async function addNewResident(resident: Resident) {
  try {
    const residentColRef = await collectionWrapper(db, "residents");
    const residentsDocRef = await addDocWrapper(residentColRef, resident);
    return new URL(`/${residentsDocRef.id}`, process.env.DOMAIN);
  } catch (error) {
    throw new Error("Failed to Add a New Resident.\n\t\t" + error);
  }
}

export async function updateNewResident(
  residentId: string,
  resident: Resident
) {
  try {
    const residentDocRef = await docWrapper(db, "residents", residentId);
    return updateDocWrapper(residentDocRef, resident);
  } catch (error) {
    throw new Error("Failed to Update the Resident.\n\t\t" + error);
  }
}

export async function getResidentData(residentId: string) {
  try {
    const residentsDocRef = await docWrapper(db, "residents", residentId);
    const residentsSnap = await getDocWrapper(residentsDocRef);
    const residentData = residentsSnap.data();
    if (!isTypeResident(residentData))
      throw new Error("Object is not of type Resident -- Line:22");
    const emContactData: EmergencyContact[] = [];
    for (const emContactId of residentData.emergency_contact_id) {
      const emContactsDoc = await docWrapper(
        db,
        "emergency-contacts",
        emContactId
      );
      const emContactsSnap = await getDocWrapper(emContactsDoc);
      const singleEmConData = emContactsSnap.data();
      if (!isTypeEmergencyContact(singleEmConData))
        throw new Error("Object is not of type Emergency Contact");
      emContactData.push(singleEmConData);
    }
    const resident = {
      ...residentData,
      id: residentId,
      emergency_contacts: emContactData,
    };
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident -- Line:42");
    return resident;
  } catch (error) {
    throw new Error("Failed to fetch resident Data.\n\t\t" + error);
  }
}

export async function getAllResidentsData() {
  try {
    const collectionResponse = await collectionWrapper(db, "residents");
    const residentsCollection = collectionResponse;
    const q = await queryWrapper(residentsCollection);
    const residentsData = await getDocsWrapper(q);

    const residents: Resident[] = [];

    for (const doc of residentsData.docs) {
      let resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Line:61");
      const emContactData: EmergencyContact[] = [];
      for (const emContactId of resident.emergency_contact_id) {
        const emContactsDoc = await docWrapper(
          db,
          "emergency-contacts",
          emContactId
        );
        const emContactsSnap = await getDocWrapper(emContactsDoc);
        const singleEmConData = emContactsSnap.data();
        if (!isTypeEmergencyContact(singleEmConData))
          throw new Error("Object is not of type Emergency Contact -- Line:72");
        emContactData.push(singleEmConData);
      }
      resident = {
        ...resident,
        id: doc.id,
        emergency_contacts: emContactData,
      };
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Line:81");
      residents.push(resident);
    }
    return residents;
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data:\n\t\t" + error);
  }
}

export async function getAllResidentsDataLite() {
  try {
    const collectionResponse = await collectionWrapper(db, "residents");
    const residentsCollection = collectionResponse;
    const q = await queryWrapper(residentsCollection);
    const residentsData = await getDocsWrapper(q);
    return residentsData.docs.map((doc) => {
      const resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Line:97");
      return {
        ...resident,
        id: doc.id,
      };
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data.\n\t\t" + error);
  }
}
