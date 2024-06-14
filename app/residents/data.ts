import db from "@/firebase/config";
import {
  addDocWrapper,
  collectionWrapper,
  deleteDocWrapper,
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
  ResidentData,
} from "@/types/resident";

export async function addNewResident(resident: ResidentData) {
  "use server";
  try {
    const { emergency_contacts: emergencyContacts } = resident;
    resident.emergency_contact_id = resident.emergency_contact_id ?? [];
    if (emergencyContacts && emergencyContacts.length)
      for (const contact of emergencyContacts) {
        const contactColRef = await collectionWrapper(db, "emergency-contacts");
        const contactDocRef = await addDocWrapper(contactColRef, contact);
        if (!contactDocRef.id)
          throw new Error("Failed to Add Emergency Contact Info. -- Line:28");
        resident.emergency_contact_id.push(contactDocRef.id);
      }
    const residentColRef = await collectionWrapper(db, "residents");
    const { emergency_contacts, ...newResident } = resident;
    const residentsDocRef = await addDocWrapper(residentColRef, newResident);
    return new URL(
      `/residents/${residentsDocRef.id}`,
      process.env.DOMAIN
    ).toString();
  } catch (error) {
    throw new Error("Failed to Add a New Resident.\n\t\t" + error);
  }
}

export async function deleteResidentData(
  residentData: ResidentData,
  residentId: string
) {
  "use server";
  try {
    const { emergency_contact_id: emergencyContactIds } = residentData;
    if (emergencyContactIds) {
      Promise.all(
        emergencyContactIds.map(async (id) => {
          const contactDocRef = await docWrapper(db, "emergency-contacts", id);
          await deleteDocWrapper(contactDocRef);
        })
      );
    }
    console.log(residentId);
    const residentDocRef = await docWrapper(db, "residents", residentId);
    return deleteDocWrapper(residentDocRef);
  } catch (error) {
    throw new Error("Failed to Delete the Resident.\n\t\t" + error);
  }
}

export async function updateResident(
  resident: ResidentData,
  residentId: string
) {
  "use server";
  try {
    const { emergency_contacts, emergency_contact_id } = resident;
    if (
      emergency_contacts &&
      emergency_contact_id &&
      emergency_contacts.length
    ) {
      const emergencyContacts = emergency_contacts.map((ec, i) => ({
        ...ec,
        id: emergency_contact_id[i],
      }));
      Promise.all(
        emergencyContacts.map(async (contact) => {
          if (!contact.id)
            throw new Error(
              "Must include Id in Emergency Contact Object -- Line:52"
            );
          const contactDocRef = await docWrapper(
            db,
            "emergency-contacts",
            contact.id
          );
          await updateDocWrapper(contactDocRef, contact);
        })
      );
    }
    const residentDocRef = await docWrapper(db, "residents", residentId);
    return updateDocWrapper(residentDocRef, resident);
  } catch (error) {
    throw new Error("Failed to Update the Resident.\n\t\t" + error);
  }
}

export async function mutateResidentData(
  resident: ResidentData
): Promise<string>;
export async function mutateResidentData(
  resident: ResidentData,
  residentId: string
): Promise<void>;
export async function mutateResidentData(
  resident: ResidentData,
  residentId?: string
) {
  "use server";
  if (residentId) return updateResident(resident, residentId);
  return addNewResident(resident);
}

export async function getResidentData(residentId: string) {
  try {
    const residentsDocRef = await docWrapper(db, "residents", residentId);
    const residentsSnap = await getDocWrapper(residentsDocRef);
    const residentData = residentsSnap.data();
    if (!isTypeResident(residentData))
      throw new Error("Object is not of type Resident -- Line:105");
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
        throw new Error("Object is not of type Emergency Contact -- Line:116");
      emContactData.push(singleEmConData);
    }
    const resident = {
      ...residentData,
      id: residentId,
      emergency_contacts: emContactData,
    };
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident -- Line:125");
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
        throw new Error("Object is not of type Resident -- Line:144");
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
          throw new Error(
            "Object is not of type Emergency Contact -- Line:155"
          );
        emContactData.push(singleEmConData);
      }
      resident = {
        ...resident,
        id: doc.id,
        emergency_contacts: emContactData,
      };
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Line:166");
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
