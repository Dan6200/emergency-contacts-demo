export interface EmergencyContact {
  name: string;
  relationship: string;
  phone_number: string;
  id?: string;
}

export interface ResidentData {
  name: string;
  address: string;
  unit_number: string;
  emergency_contact_id?: string[];
  emergency_contacts?: EmergencyContact[];
}

export interface Resident {
  id: string;
  name: string;
  address: string;
  unit_number: string;
  emergency_contact_id: string[];
}

export const isTypeResident = (data: unknown): data is Resident =>
  !!data &&
  typeof data === "object" &&
  "name" in data &&
  "address" in data &&
  "unit_number" in data;

export const isTypeEmergencyContact = (
  data: unknown
): data is EmergencyContact =>
  !!data &&
  typeof data === "object" &&
  "name" in data &&
  "relationship" in data &&
  "phone_number" in data;
