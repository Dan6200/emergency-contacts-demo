export interface Residence {
  residence_id: string;
  room: string;
  address: string;
}

export const isTypeResidence = (data: unknown): data is Residence =>
  !!data &&
  typeof data === "object" &&
  "residence_id" in data &&
  "room" in data &&
  "address" in data;

export interface Resident {
  resident_id: string;
  residence_id: string;
  resident_name: string | null;
}

export const isTypeResident = (data: unknown): data is Resident =>
  !!data &&
  typeof data === "object" &&
  "resident_id" in data &&
  "residence_name" in data &&
  "residence_id" in data;

export interface EmergencyContact {
  residence_id: string;
  resident_id: string;
  contact_name: string | null;
  cell_phone: string | null;
  work_phone: string | null;
  home_phone: string | null;
  relationship: string | null;
}

export const isTypeEmergencyContact = (
  data: unknown
): data is EmergencyContact =>
  !!data &&
  typeof data === "object" &&
  "residence_id" in data &&
  "resident_id" in data &&
  "contact_name" in data &&
  "cell_phone" in data &&
  "work_phone" in data &&
  "home_phone" in data &&
  "relationship" in data;
