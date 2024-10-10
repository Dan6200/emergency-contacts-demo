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

export interface Resident {
  resident_id: string;
  residence_id: string;
  resident_name: string | null;
}

export interface ResidentData {
  resident_id: string;
  residence_id: string;
  resident_name: string | null;
  emergencyContacts:
    | [
        {
          contact_name: string | null;
          cell_phone: string | null;
          work_phone: string | null;
          home_phone: string | null;
          relationship: string | null;
        }
      ]
    | null;
}

export const isTypeResidentData = (data: unknown): data is ResidentData => {
  return (
    (!!data &&
      typeof data === "object" &&
      "resident_id" in data &&
      typeof data.resident_id === "string" &&
      "residence_id" in data &&
      typeof data.residence_id === "string" &&
      "resident_name" in data &&
      (typeof data.resident_name === "string" || data.resident_name === null) &&
      "emergencyContacts" in data &&
      Array.isArray(data.emergencyContacts) &&
      data.emergencyContacts.every(
        (contact: any) =>
          typeof contact === "object" &&
          "contact_name" in contact &&
          (typeof contact.contact_name === "string" ||
            contact.contact_name === null) &&
          "cell_phone" in contact &&
          (typeof contact.cell_phone === "string" ||
            contact.cell_phone === null) &&
          "work_phone" in contact &&
          (typeof contact.work_phone === "string" ||
            contact.work_phone === null) &&
          "home_phone" in contact &&
          (typeof contact.home_phone === "string" ||
            contact.home_phone === null) &&
          "relationship" in contact &&
          (typeof contact.relationship === "string" ||
            contact.relationship === null)
      )) ||
    (data as any).emergencyContacts === null
  );
};

export const isTypeResident = (data: unknown): data is Resident =>
  !!data &&
  typeof data === "object" &&
  "resident_id" in data &&
  "resident_name" in data &&
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

export interface RoomData {
  id: string;
  residence_id: string;
  roomNo: string;
  address: string;
  residents: [
    {
      id: string;
      resident_id: string;
      resident_name: string | null;
    }
  ];
}

export const isTypeRoomData = (data: unknown): data is RoomData => {
  if (
    !!data &&
    typeof data === "object" &&
    "id" in data &&
    typeof (data as any).id === "string" &&
    "residence_id" in data &&
    typeof (data as any).residence_id === "string" &&
    "roomNo" in data &&
    typeof (data as any).roomNo === "string" &&
    "address" in data &&
    typeof (data as any).address === "string" &&
    "residents" in data &&
    Array.isArray((data as any).residents)
  ) {
    return (data as any).residents.every(
      (resident: any) =>
        typeof resident === "object" &&
        "id" in data &&
        "resident_id" in resident &&
        typeof resident.resident_id === "string" &&
        "resident_name" in resident &&
        (typeof resident.resident_name === "string" ||
          resident.resident_name === null)
    );
  }
  return false;
};
