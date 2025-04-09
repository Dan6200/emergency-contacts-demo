import {
	DocumentData,
	FirestoreDataConverter,
	QueryDocumentSnapshot,
} from "firebase/firestore";

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
	toFirestore(contact: Residence): DocumentData {
		return {...contact}; // Map Residence fields to Firestore
	},
	fromFirestore(snapshot: QueryDocumentSnapshot): Residence {
		return snapshot.data() as Residence; // Map Firestore data to EmergencyContact
	},
};

