type Nullable<T> = T | null | undefined;

export interface RoomData {
	document_id: string;
	residence_id: string;
	roomNo: string;
	address: string;
	residents:
	| [
		{
			document_id: string;
			resident_id: string;
			resident_name: Nullable<string>;
		}
	]
	| null;
}

export const isTypeRoomData = (data: unknown): data is RoomData =>
	!!data &&
	typeof data === "object" &&
	"document_id" in data &&
	typeof (data as any).document_id === "string" &&
	"residence_id" in data &&
	typeof (data as any).residence_id === "string" &&
	"roomNo" in data &&
	typeof (data as any).roomNo === "string" &&
	"address" in data &&
	typeof (data as any).address === "string" &&
	"residents" in data &&
	((data as any).residents === null ||
		(Array.isArray((data as any).residents) &&
			(data as any).residents.every(
				(resident: any) =>
					typeof resident === "object" &&
					"document_id" in data &&
					typeof (data as any).document_id === "string" &&
					"resident_id" in resident &&
					typeof resident.resident_id === "string" &&
					"resident_name" in resident &&
					(typeof resident.resident_name === "string" ||
						resident.resident_name === null)
			)));
