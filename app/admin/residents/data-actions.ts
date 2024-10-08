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
import { where, limit, writeBatch } from "firebase/firestore";
import {
  EmergencyContact,
  isTypeEmergencyContact,
  isTypeResidence,
  isTypeResident,
  Resident,
  Residence,
} from "@/types/resident";
import { notFound } from "next/navigation";
import util from "node:util";

export async function addNewResident(newResident: Resident) {
  try {
    const residentColRef = await collectionWrapper(db, "residents");
    await addDocWrapper(residentColRef, newResident);
    return {
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
    const residentColRef = await collectionWrapper(db, "residents");
    const resQ = await queryWrapper(
      residentColRef,
      where("resident_id", "==", residentId)
    );
    const resSnap = await getDocsWrapper(resQ);
    if (resSnap.size > 0)
      throw new Error(
        "Cannot Update More Than One Resident, Possible Duplicated Data"
      );
    await updateDocWrapper(resSnap.docs[0].ref, newResidentData);
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
    const residentsColRef = await collectionWrapper(db, "residents");
    const resQ = await queryWrapper(
      residentsColRef,
      where("resident_id", "==", residentId)
    );
    const residentsSnap = await getDocsWrapper(resQ);
    if (residentsSnap.size > 1)
      throw new Error("Duplicate Resident Data Is Not Allowed!");
    const doc = residentsSnap.docs[0];
    if (!doc.exists) throw notFound();
    const resident = doc.data();
    if (!resident) throw notFound();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident  -- Tag:16");

    //Fetch and join contact data...
    const emergencyContacts = [];
    const emContactsCollection = await collectionWrapper(
      db,
      "emergency_contacts"
    );
    const contQ = await queryWrapper(
      emContactsCollection,
      where("resident_id", "==", residentId)
    );
    const contactData = await getDocsWrapper(contQ);
    for (const doc of contactData.docs) {
      if (!doc.exists()) throw notFound();
      console.log(doc.data());
      if (!isTypeEmergencyContact(doc.data()))
        throw new Error("Object is not of type Emergency Contacts -- Tag:29");
      const { residence_id, resident_id, ...contact } = <any>doc.data();
      emergencyContacts.push(contact);
    }

    return { ...resident, emergencyContacts };
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
      if (!doc.exists) throw notFound();
      const residence = doc.data();
      if (!isTypeResidence(residence))
        throw new Error("Object is not of type Residence  -- Tag:19");
      return { id: doc.id, ...residence };
    });
  } catch (error) {
    throw new Error("Failed to fetch All Room Data.\n\t\t" + error);
  }
}

export async function getRoomData(residenceId: string) {
  /******************************************
   * Creates a Join Between Residence,
   * Emergency Contacts and Resident documents on residenceId
   * *********************************************************/

  try {
    const addressDoc = await getDocWrapper(
      await docWrapper(db, "residence", residenceId)
    );

    const residents_map: any = {};
    const room_map: any = {};
    if (!addressDoc.exists()) throw notFound();
    const address = {
      ...(addressDoc.data() as any),
      id: addressDoc.id,
    };
    //console.log("address", address);
    if (!isTypeResidence(address))
      throw new Error("Object is not of type Residence -- Tag:10");
    room_map[address.residence_id] = {
      ...room_map[address.residence_id],
      ...address,
    };

    // Fetch and join resident data...
    const residentsCollection = await collectionWrapper(db, "residents");
    const resQ = await queryWrapper(
      residentsCollection,
      where("residence_id", "==", address.residence_id)
    );
    const residentsData = await getDocsWrapper(resQ);
    for (const doc of residentsData.docs) {
      if (!doc.exists()) throw notFound();
      let resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Tag:9");

      // Add each resident to the residents map
      // Handle duplicates
      if (residents_map[resident.resident_id])
        throw new Error("Duplicate Resident Data! -- Tag:28");
      const { residence_id, ...newResident } = resident;
      residents_map[resident.resident_id] = { ...newResident };

      // Add all residents in the resident map to the room map
      room_map[resident.residence_id] = {
        ...room_map[resident.residence_id],
        residents: [
          ...(room_map[resident.residence_id].residents ?? []),
          residents_map[resident.resident_id],
        ],
      };
    }

    if (Object.values(room_map).length > 1)
      throw new Error("Duplicate Room Data! -- Tag:28");
    const roomData = Object.values(room_map)[0];
    return roomData;
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data:\n\t\t" + error);
  }
}

export async function deleteResidentData(residentId: string) {
  try {
    const residentColRef = await collectionWrapper(db, "residents", residentId);
    const contactColRef = await collectionWrapper(
      db,
      "emergency_contacts",
      residentId
    );
    const resQ = await queryWrapper(
      residentColRef,
      where("resident_id", "==", residentId)
    );

    const contQ = await queryWrapper(
      contactColRef,
      where("resident_id", "==", residentId)
    );

    const batch = writeBatch(db);
    const resSnap = await getDocsWrapper(resQ);
    const contSnap = await getDocsWrapper(contQ);
    if (resSnap.size > 1)
      throw new Error(
        "Cannot Delete More Than One Resident, Possible Duplicate Data"
      );
    batch.delete(resSnap.docs[0].ref);
    contSnap.forEach((doc) => batch.delete(doc.ref));
    return { success: true, message: "Successfully Deleted Resident" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Delete the Resident.",
    };
  }
}
