"use server";
import db from "@/firebase/server/config";
import { collectionWrapper } from "@/firebase/firestore";
import {
  isTypeEmergencyContact,
  isTypeResidence,
  isTypeResident,
  Resident,
} from "@/types/resident";
import { notFound } from "next/navigation";
import util from "node:util";

export async function addNewResident(newResident: Resident) {
  try {
    const residentColRef = collectionWrapper("residents");
    await residentColRef.add(newResident);
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
    const residentColRef = collectionWrapper("residents");
    const resSnap = await residentColRef.doc(residentId).get();
    if (!resSnap.exists) throw notFound();
    await resSnap.ref.update(<any>newResidentData);
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
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: Resident,
  residentId: string
): Promise<
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: Resident,
  residentId?: string
) {
  if (residentId) return updateResident(resident, residentId);
  return addNewResident(resident);
}

export async function getResidentData(residentId: string) {
  try {
    const residentsColRef = collectionWrapper("residents");
    const residentsSnap = await residentsColRef.doc(residentId).get();
    if (!residentsSnap.exists) throw notFound();
    const resident = residentsSnap.data();
    if (!isTypeResident(resident))
      throw new Error("Object is not of type Resident  -- Tag:16");

    //Fetch and join contact data...
    const emergencyContacts = [];
    const emContactsCollection = collectionWrapper("emergency_contacts");
    const contQ = emContactsCollection.where(
      "resident_id",
      "==",
      resident.resident_id
    );
    const contactData = await contQ.get();
    for (const doc of contactData.docs) {
      if (!doc.exists) throw notFound();
      if (!isTypeEmergencyContact(doc.data()))
        throw new Error("Object is not of type Emergency Contacts -- Tag:29");
      const { residence_id, resident_id, ...contact } = <any>doc.data();
      emergencyContacts.push(contact);
    }

    return { ...resident, id: residentsSnap.id, emergencyContacts };
  } catch (error) {
    throw new Error("Failed to fetch resident.\n\t\t" + error);
  }
}

export async function getResidents() {
  try {
    const residentsCollection = collectionWrapper("residents");
    const residentsSnap = await residentsCollection.get();
    return residentsSnap.docs.map((doc) => {
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
    const roomsCollection = collectionWrapper("residence");
    const roomsSnap = await roomsCollection.get();
    if (!roomsSnap.size) throw notFound();
    return roomsSnap.docs.map((doc) => {
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
    const addressCollection = collectionWrapper("residence");
    const addressSnap = await addressCollection.doc(residenceId).get();
    const residents_map: any = {};
    const room_map: any = {};
    if (!addressSnap.exists) throw notFound();
    const address = {
      ...(addressSnap.data() as any),
      id: addressSnap.id,
    };
    if (!isTypeResidence(address))
      throw new Error("Object is not of type Residence -- Tag:10");
    room_map[address.residence_id] = {
      ...room_map[address.residence_id],
      ...address,
    };

    // Fetch and join resident data...
    const residentsCollection = collectionWrapper("residents");
    const resQ = residentsCollection.where(
      "residence_id",
      "==",
      address.residence_id
    );
    const residentsData = await resQ.get();
    for (const doc of residentsData.docs) {
      if (!doc.exists) throw notFound();
      let resident = doc.data();
      if (!isTypeResident(resident))
        throw new Error("Object is not of type Resident -- Tag:9");

      // Add each resident to the residents map
      // Handle duplicates
      if (residents_map[resident.resident_id])
        throw new Error("Duplicate Resident Data! -- Tag:28");
      const { residence_id, ...newResident } = resident;
      residents_map[resident.resident_id] = { ...newResident, id: doc.id };

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
    const residentColRef = collectionWrapper("residents");
    const contactColRef = collectionWrapper("emergency_contacts");
    const resSnap = await residentColRef.doc(residentId).get();
    const contQ = contactColRef.where("resident_id", "==", residentId);

    const batch = db.batch();
    const contSnap = await contQ.get();
    if (!resSnap.exists) throw notFound();
    batch.delete(resSnap.ref);
    contSnap.forEach((doc) => batch.delete(doc.ref));
    return { success: true, message: "Successfully Deleted Resident" };
  } catch (error) {
    return {
      success: false,
      message: "Failed to Delete the Resident.",
    };
  }
}
