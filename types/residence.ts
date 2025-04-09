import {
	DocumentData,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export interface Residence {
	residence_id: string;
	roomNo: string;
	address: string;
}

export const isTypeResidence = (data: unknown): data is Residence =>
	!!data &&
	typeof data === "object" &&
	"residence_id" in data &&
	"roomNo" in data &&
	"address" in data;

export const residenceConverter: FirestoreDataConverter<Residence> = {
	toFirestore(residence: Residence): DocumentData {
		// Ensure we only send fields belonging to the Residence type to Firestore
		const {residence_id, roomNo, address} = residence;
		return {residence_id, roomNo, address};
	},
	fromFirestore(snapshot: QueryDocumentSnapshot): Residence {
		const data = snapshot.data();
		// Validate data structure before casting
		if (!isTypeResidence(data)) {
			console.error("Firestore data does not match Residence type:", data);
			throw new Error(`Firestore data (${snapshot.id}) does not match Residence type.`);
		}
		// The document_id is typically added outside the converter after fetching
		return data as Residence;
	},
};

