"use server";
import { collectionWrapper } from "@/firebase/firestore";
import db from "@/firebase/server/config";
import {
  EmergencyContact,
  emergencyContactConverter,
  // isTypeEmergencyContact,
} from "@/types/emergency_contacts";
import { Resident, residentConverter, ResidentData } from "@/types/resident";
import {
  Residence,
  residenceConverter,
  isTypeResidence,
} from "@/types/residence";
import { Transaction } from "firebase-admin/firestore";
import { notFound } from "next/navigation";

/** TODO: Replace all Fetching with Real-Time listeners **/

export async function addNewEmergencyContact(
  contact: EmergencyContact,
  transaction: Transaction,
) {
  try {
    // Apply the converter
    const contactRef = collectionWrapper("emergency_contacts")
      .withConverter(emergencyContactConverter)
      .doc();
    // The transaction methods should infer the type from the converted collection reference
    transaction.set(contactRef, contact);
    return true;
  } catch (error) {
    return false;
  }
}

export async function addNewResident(
  residentData: Omit<ResidentData, "resident_id">,
) {
  try {
    await db.runTransaction(async (transaction) => {
      const metadataRef = collectionWrapper("metadata").doc("lastResidentID");
      const metadataSnap = await transaction.get(metadataRef);
      if (!metadataSnap.exists)
        throw new Error("lastResidentID metadata not found");
      const { resident_id: oldResidentId } = <any>metadataSnap.data();
      const resident_id = (parseInt(oldResidentId as any) + 1).toString();
      const { emergencyContacts, ...resident } = {
        ...residentData,
        resident_id,
      };
      // Apply the converter
      const residentRef = collectionWrapper("residents")
        .withConverter(residentConverter)
        .doc();

      if (emergencyContacts && emergencyContacts.length) {
        const { residence_id } = resident;
        await Promise.all(
          emergencyContacts.map((contact) =>
            addNewEmergencyContact(
              {
                ...contact,
                residence_id,
                resident_id,
              },
              transaction, // Pass the transaction object directly
            ),
          ),
        );
      }
      // Ensure the 'resident' object matches the 'Resident' type for the converter
      const residentToSave: Resident = {
        resident_id: resident.resident_id,
        residence_id: resident.residence_id,
        resident_name: resident.resident_name,
      };
      transaction.set(residentRef, residentToSave);
      transaction.update(metadataRef, { resident_id });
    });
    return {
      message: "Successfully Added a New Resident",
      success: true,
    };
  } catch (error) {
    console.error("Failed to Add a New Resident.", error);
    return {
      success: false,
      message: "Failed to Add a New Resident",
    };
  }
}

export async function updateResident(
  newResidentData: ResidentData,
  documentId: string,
) {
  try {
    debugger;
    await db.runTransaction(async (transaction) => {
      // Apply the converter
      const residentRef = collectionWrapper("residents")
        .withConverter(residentConverter)
        .doc(documentId);
      console.log(residentRef);
      const resSnap = await transaction.get(residentRef);
      if (!resSnap.exists) throw notFound();
      // resSnap.data() will now return a typed Resident object
      const existingResidentData = resSnap.data();
      if (!existingResidentData) throw new Error("Invalid Conversion");

      const { emergencyContacts: newEmergencyContacts, ...residentUpdateData } =
        newResidentData;
      const residentId = residentUpdateData.resident_id; // Get resident_id from the data
      // Use existingResidentData from the typed snapshot
      const residenceId = existingResidentData.residence_id;

      // Apply the converter
      const emContactsCollection = collectionWrapper(
        "emergency_contacts",
      ).withConverter(emergencyContactConverter);
      const contactsQuery = emContactsCollection.where(
        "resident_id",
        "==",
        residentId,
      );
      // Fetch contacts outside the transaction for reads, or use transaction.get if needed within transaction logic
      const existingContactsSnap = await contactsQuery.get();
      if (!existingContactsSnap) throw new Error("Invalid Conversion");

      // doc.data() is now typed via the converter
      const existingContactsMap = new Map(
        existingContactsSnap.docs.map((doc) => [
          doc.data().cell_phone,
          doc.ref,
        ]),
      );
      const newContactsMap = new Map(
        newEmergencyContacts?.map((contact) => [contact.cell_phone, contact]) ??
          [],
      );

      // Delete contacts that exist in Firestore but are not in the new list
      for (const [cellPhone, docRef] of existingContactsMap.entries()) {
        if (!newContactsMap.has(cellPhone)) {
          transaction.delete(docRef);
        }
      }

      // Add contacts that are in the new list but not in Firestore
      if (newEmergencyContacts) {
        for (const contact of newEmergencyContacts) {
          if (!existingContactsMap.has(contact.cell_phone)) {
            // Collection already has converter applied
            const newDocRef = emContactsCollection.doc();
            // Ensure the contact object includes resident_id and residence_id
            if (!residenceId)
              throw new Error(
                "Residence ID should be obtained from the old resident document",
              );
            const contactToAdd: EmergencyContact = {
              ...contact,
              resident_id: residentId,
              residence_id: residenceId,
            };
            transaction.set(newDocRef, contactToAdd);
          }
          // Note: This logic doesn't update existing contacts.
          // If a contact exists in both lists, it's left unchanged.
          // To implement updates, compare fields and use transaction.update().
        }
      }

      // Update the resident document itself with the resident-specific fields

      // Construct the update payload using only fields from the Resident type
      const finalResidentUpdate: Partial<Resident> = {
        // resident_id should generally not be updated, but included if necessary
        // residence_id might change if the resident moves rooms
        residence_id: residentUpdateData.residence_id,
        resident_name: residentUpdateData.resident_name,
        // Add other Resident fields here if they are part of residentUpdateData
      };
      // Use the typed residentRef from above
      transaction.update(residentRef, finalResidentUpdate);
    });
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
  resident: Omit<ResidentData, "resident_id">,
): Promise<
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: ResidentData,
  residentId: string,
): Promise<
  { message: string; success: boolean } | { message: string; success: boolean }
>;
export async function mutateResidentData(
  resident: ResidentData | Omit<ResidentData, "resident_id">,
  residentId?: string,
) {
  if (residentId && "resident_id" in resident)
    return updateResident(resident, residentId);
  return addNewResident(resident);
}

export async function getResidentData(documentId: string) {
  // Changed parameter name for clarity
  try {
    // Apply the converter
    const residentsColRef =
      collectionWrapper("residents").withConverter(residentConverter);
    const residentsSnap = await residentsColRef.doc(documentId).get();
    if (!residentsSnap.exists) throw notFound();
    // resident is now typed by the converter
    const resident = residentsSnap.data();
    // The type guard check might become redundant if the converter handles validation
    // if (!isTypeResident(resident)) // Keep or remove based on converter's strictness
    // 	throw new Error("Object is not of type Resident  -- Tag:16");

    //Fetch and join contact data...
    let emergencyContacts: EmergencyContact[] = []; // Initialize as empty array
    // Apply the converter
    const emContactsCollection = collectionWrapper(
      "emergency_contacts",
    ).withConverter(emergencyContactConverter);
    const contQ = emContactsCollection.where(
      "resident_id",
      "==",
      resident?.resident_id,
    );
    const contactData = await contQ.get();
    // doc.data() is now typed by the converter
    emergencyContacts = contactData.docs.map((doc) => {
      const contact = doc.data();
      // Optional: Add document_id to each contact if needed downstream
      // return { ...contact, document_id: doc.id };
      return contact;
    });
    // If no contacts found, emergencyContacts remains an empty array []

    // Combine resident data (already typed) with its document ID and fetched contacts
    return { ...resident, document_id: residentsSnap.id, emergencyContacts };
  } catch (error) {
    throw new Error("Failed to fetch resident.\n\t\t" + error);
  }
}

export async function getResidents(): Promise<
  (Resident & { document_id: string })[]
> {
  // Add return type
  try {
    // Apply the converter
    const residentsCollection =
      collectionWrapper("residents").withConverter(residentConverter);
    const residentsSnap = await residentsCollection.get();
    // doc.data() is now typed
    return residentsSnap.docs.map((doc) => {
      const resident = doc.data();
      // Optional: Add document_id if needed downstream
      return { ...resident, document_id: doc.id };
      // The type guard check might become redundant if the converter handles validation
      // if (!isTypeResident(resident))
      //   throw new Error("Object is not of type Resident  -- Tag:19");
      // return resident;
    });
  } catch (error) {
    throw new Error("Failed to fetch All Residents Data.\n\t\t" + error);
  }
}

export async function getAllRooms(): Promise<
  (Residence & { document_id: string })[]
> {
  // Add return type
  try {
    // Apply the converter
    const roomsCollection =
      collectionWrapper("residence").withConverter(residenceConverter);
    const roomsSnap = await roomsCollection.get();
    if (!roomsSnap.size) throw notFound();
    // doc.data() is now typed
    return roomsSnap.docs.map((doc) => {
      const residence = doc.data();
      // The type guard check might become redundant if the converter handles validation
      // if (!isTypeResidence(residence))
      // 	throw new Error("Object is not of type Residence  -- Tag:19");
      // Combine typed data with document_id
      return { document_id: doc.id, ...residence };
    });
  } catch (error) {
    throw new Error("Failed to fetch All Room Data -- Tag:14.\n\t\t" + error);
  }
}

export async function getRoomData(residenceId: string) {
  /******************************************
   * Creates a Join Between Residence,
   * Emergency Contacts and Resident documents on residenceId
   * *********************************************************/
  // Define the expected return type structure
  type RoomDataWithResidents = Residence & {
    document_id: string;
    residents:
      | (Omit<Resident, "residence_id"> & { document_id: string })[]
      | null;
  };

  try {
    // Apply the converter
    const addressCollection =
      collectionWrapper("residence").withConverter(residenceConverter);
    const addressSnap = await addressCollection.doc(residenceId).get();
    if (!addressSnap.exists) throw notFound();
    // addressData is now typed
    const addressData = addressSnap.data();
    // The type guard check may be redundant because the converter handles validation, yet typescript doesn't seem to know that
    if (!isTypeResidence(addressData))
      throw new Error("Object is not of type Residence -- Tag:10");

    // Initialize the result object structure
    const roomDataResult: RoomDataWithResidents = {
      ...addressData,
      document_id: addressSnap.id,
      residents: null, // Initialize residents as null
    };

    // Fetch and join resident data...
    // Apply the converter
    const residentsCollection =
      collectionWrapper("residents").withConverter(residentConverter);
    const resQ = residentsCollection.where(
      "residence_id",
      "==",
      addressData.residence_id, // Use typed data
    );
    const residentsDataSnap = await resQ.get();

    if (residentsDataSnap.size > 0) {
      roomDataResult.residents = residentsDataSnap.docs.map((doc) => {
        if (!doc.exists) {
          // This case should ideally not happen in a query result, but handle defensively
          console.warn(
            `Resident document ${doc.id} not found in room ${residenceId}`,
          );
          // Depending on requirements, you might throw, return null, or filter out
          // For now, let's filter it out later if needed, or handle the type appropriately.
          // Returning a placeholder or throwing might be better.
          throw new Error(`Resident document ${doc.id} unexpectedly missing.`);
        }
        // resident is now typed
        const resident = doc.data();
        // The type guard check might become redundant
        // if (!isTypeResident(resident))
        // 	throw new Error("Object is not of type Resident -- Tag:9");

        // Omit residence_id and add document_id
        const { residence_id, ...residentInfo } = resident;
        return {
          ...residentInfo,
          document_id: doc.id,
        };
      });
    }
    // No need for intermediate maps (residents_map, room_map) anymore

    return roomDataResult; // Return the structured result
  } catch (error) {
    // Log the specific error for better debugging
    console.error(
      `Failed to fetch Room Data for residenceId ${residenceId}:`,
      error,
    );
    // Re-throw a more specific error or handle as needed
    throw new Error(
      `Failed to fetch Room Data for ${residenceId}. -- Tag:15\n\t\t` + error,
    );
  }
}

export async function deleteResidentData(documentId: string) {
  try {
    await db.runTransaction(async (transaction) => {
      // Apply converters
      const residentDocRef = collectionWrapper("residents")
        .withConverter(residentConverter)
        .doc(documentId);
      const contactColRef = collectionWrapper(
        "emergency_contacts",
      ).withConverter(emergencyContactConverter); // Apply converter here too

      const resSnap = await transaction.get(residentDocRef);
      if (!resSnap.exists) throw notFound();
      // resSnap.data() is now typed
      const residentData = resSnap.data();
      if (!residentData) throw new Error("Invalid Conversion");

      // Query contacts associated with the resident
      // Note: Performing reads (get) inside a transaction can sometimes be less efficient
      // if the data isn't strictly needed for the transaction's logic.
      // Consider fetching contacts outside if possible, but for deletion, it's often done inside.
      const contactQuery = contactColRef.where(
        "resident_id",
        "==",
        residentData.resident_id, // Use typed data
      );
      // Fetch the contacts within the transaction to ensure consistency
      const contactSnap = await transaction.get(contactQuery); // Use transaction.get for queries inside transaction

      // Delete the resident document
      transaction.delete(residentDocRef); // Use the typed ref

      // Delete associated contact documents
      contactSnap.forEach((doc) => transaction.delete(doc.ref));
    });
    return { success: true, message: "Successfully Deleted Resident" };
  } catch (error) {
    console.error("Failed to Delete the Resident.", error);
    return {
      success: false,
      message: "Failed to Delete the Resident.",
    };
  }
}
