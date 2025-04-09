type Nullable<T> = T | null | undefined;

import {
	DocumentData,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export interface Resident {
	resident_id: string;
	residence_id: string;
	resident_name: Nullable<string>;
}

export interface ResidentData {
	resident_id: string;
	residence_id: string;
	resident_name: Nullable<string>;
	document_id?: Nullable<string>;
	emergencyContacts: Nullable<
		{
			contact_name: Nullable<string>;
			cell_phone: string;
			work_phone: Nullable<string>;
			home_phone: Nullable<string>;
			relationship: Nullable<string>;
		}[]
	>;
}

export const isTypeResidentData = (data: unknown): data is ResidentData => {
	return (
		!!data &&
		typeof data === "object" &&
		"resident_id" in data &&
		typeof data.resident_id === "string" &&
		"residence_id" in data &&
		typeof data.residence_id === "string" &&
		"document_id" in data &&
		typeof data.document_id === "string" &&
		(("resident_name" in data && typeof data.resident_name === "string") ||
			(data as any).resident_name === null) &&
		"emergencyContacts" in data &&
		((Array.isArray(data.emergencyContacts) &&
			data.emergencyContacts.every(
				(contact: unknown) =>
					typeof (contact as any).cell_phone === "string" &&
					(typeof (contact as any).contact_name === "string" ||
						(contact as any).contact_name === null) &&
					(typeof (contact as any).work_phone === "string" ||
						(contact as any).work_phone === null) &&
					(typeof (contact as any).home_phone === "string" ||
						(contact as any).home_phone === null) &&
					(typeof (contact as any).relationship === "string" ||
						(contact as any).relationship === null)
			)) ||
			(data as any).emergencyContacts === null)
	);
};

export const isTypeResident = (data: unknown): data is Resident =>
	!!data &&
	typeof data === "object" &&
	"resident_id" in data &&
	"resident_name" in data &&
	"residence_id" in data;

export const residentConverter: FirestoreDataConverter<Resident> = {
	toFirestore(resident: Resident): DocumentData {
		// Ensure we only send fields belonging to the Resident type to Firestore
		const {resident_id, residence_id, resident_name} = resident;
		return {resident_id, residence_id, resident_name};
	},
	fromFirestore(snapshot: QueryDocumentSnapshot): Resident {
		const data = snapshot.data();
		// Validate data structure before casting
		if (!isTypeResident(data)) {
			// Handle error appropriately, e.g., throw an error or return a default object
			// For now, we'll throw an error, assuming data should always match the type.
			console.error("Firestore data does not match Resident type:", data);
			throw new Error(`Firestore data (${snapshot.id}) does not match Resident type.`);
		}
		// The document_id is typically added outside the converter after fetching
		return data as Resident;
	},
};
