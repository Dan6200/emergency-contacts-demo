/*************************************
 * BIG TODO!!!!
 * *************************************/

"use server";

import db from "@/firebase/config";
import {
  collectionWrapper,
  queryWrapper,
  getDocsWrapper,
  docWrapper,
  getDocWrapper,
  deleteDocWrapper,
  addDocWrapper,
  updateDocWrapper,
} from "@/firebase/firestore";
import { where, limit } from "firebase/firestore";
import {
  EmergencyContact,
  isTypeEmergencyContact,
  isTypeResidence,
  isTypeResident,
  Resident,
  Residence,
} from "@/types/resident";
import { notFound } from "next/navigation";

export async function addNewResident(newResident: Resident) {
  try {
    const residentColRef = await collectionWrapper(db, "residents");
    const residentsDocRef = await addDocWrapper(residentColRef, newResident);
    return {
      result: new URL(
        `/residents/${residentsDocRef.id}`,
        process.env.DOMAIN
      ).toString(),
      message: "Successfully Added a New Resident",
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Add a New Resident",
    };
  }
}

export async function updateResident(
  newResidentData: Resident,
  residentId: string
) {
  try {
    const residentDocRef = await docWrapper(db, "residents", residentId);
    await updateDocWrapper(residentDocRef, newResidentData);
    return {
      success: true,
      message: "Successfully Updated Resident Information",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Update the Resident",
    };
  }
}

export async function mutateResidentData(
  resident: Resident
): Promise<
  | { result?: string; message: string; success: boolean }
  | { result?: string; message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: Resident,
  residentId: string
): Promise<{ success: boolean } | { success: boolean; message?: string }>;
export async function mutateResidentData(
  resident: Resident,
  residentId?: string
) {
  if (residentId) return updateResident(resident, residentId);
  return addNewResident(resident);
}

export async function getResidentData(residentId: string) {
  try {
    const residentsDocRef = await docWrapper(db, "residents", residentId);
    const residentsSnap = await getDocWrapper(residentsDocRef);
    const resident = residentsSnap.data();
    if (!resident) throw notFound();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident  -- Tag:16");
    return resident;
  } catch (error) {
    throw new Error("Failed to fetch resident.\n\t\t" + error);
  }
}

export async function getResidents() {
  try {
    const collectionResponse = await collectionWrapper(db, "residents");
    const residentsCollection = collectionResponse;
    const q = await queryWrapper(residentsCollection);
    const residentsData = await getDocsWrapper(q);
    return residentsData.docs.map((doc) => {
      const resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident  -- Tag:19");
      return resident;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data.\n\t\t" + error);
  }
}

export async function getAllRooms() {
  try {
    const collectionResponse = await collectionWrapper(db, "residence");
    const roomsCollection = collectionResponse;
    const q = await queryWrapper(roomsCollection);
    const roomsData = await getDocsWrapper(q);
    return roomsData.docs.map((doc) => {
      const residence = doc.data();
      if (!isTypeResidence(residence))
        throw new Error("Object is not of type Residence  -- Tag:19");
      return residence;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residence Data.\n\t\t" + error);
  }
}

export async function getResidentsData(residenceId: string) {
  /******************************************
   * Create a Join Between Residence,
   * Emergency Contacts and Resident documents on residenceId
   * *********************************************************/

  try {
    const addressCollection = await collectionWrapper(db, "residence");
    const residentsCollection = await collectionWrapper(db, "residents");
    const emContactsCollection = await collectionWrapper(
      db,
      "emergency_contacts"
    );

    const resident_id_map: any = [];
    const room_map: any = [];

    // Fetch resident data...
    const resQ = await queryWrapper(
      residentsCollection,
      where("residence_id", "==", residenceId)
    );
    const residentsData = await getDocsWrapper(resQ);
    for (const doc of residentsData.docs) {
      let resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Tag:9");

      // Add each resident to the map
      resident_id_map[resident.resident_id] = {
        ...resident,
        ...resident_id_map[resident.resident_id],
      };

      // Add all residents in the resident map to the room map
      room_map[resident.residence_id] = {
        ...room_map[resident.residence_id],
        residents: [
          ...(room_map[resident.residence_id].residents ?? []),
          resident_id_map[resident.resident_id],
        ],
      };
    }

    // Fetch and join contact data...
    const contQ = await queryWrapper(emContactsCollection);
    const contactData = await getDocsWrapper(contQ);
    for (const doc of contactData.docs) {
      let contact = doc.data();
      if (!isTypeEmergencyContact(contact))
        throw new Error("Object is not of type Emergency Contacts -- Tag:11");

      if (resident_id_map[contact.resident_id]) {
        resident_id_map[contact.resident_id].contacts = [
          ...(resident_id_map[contact.resident_id].contacts ?? []),
          contact,
        ];
      }

      // Update room map with modified residents map...
      const residenceId = resident_id_map[contact.resident_id].residence_id;
      room_map[residenceId] = {
        ...room_map[residenceId],
        residents: [
          ...(room_map[residenceId]?.residents || []),
          resident_id_map[contact.resident_id],
        ],
      };
    }

    // Fetch and join address data...
    const addressQ = await queryWrapper(
      addressCollection,
      where("residence_id", "==", residenceId),
      limit(1)
    );
    let addressSnap = await getDocsWrapper(addressQ);
    for (const doc of addressSnap.docs) {
      const address = doc.data();
      if (!isTypeResidence(address))
        throw new Error("Object is not of type Residence -- Tag:10");
      room_map[address.residence_id] = {
        ...room_map[address.residence_id],
        address,
      };
    }

    return Object.entries(room_map);
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data:\n\t\t" + error);
  }
}

export async function deleteResidentData(residentId: string) {
  try {
    const residentDocRef = await docWrapper(db, "residents", residentId);
    const addressDocRef = await docWrapper(db, "residence", residentId);
    const contactDocRef = await docWrapper(
      db,
      "emergency_contacts",
      residentId
    );
    await deleteDocWrapper(residentDocRef);
    return { success: true, message: "Successfully Deleted Resident" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Delete the Resident.",
    };
  }
}
