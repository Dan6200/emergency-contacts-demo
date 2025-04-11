export const mockNewResidentData = {
  residence_id: "B2",
  resident_name: "Alice Smith",
  emergencyContacts: [
    {
      contact_name: "Bob Smith",
      relationship: "Husband",
      cell_phone: "555-3333",
      home_phone: null,
      work_phone: null,
    },
  ],
};

export const mockExistingResidentData = {
  document_id: "existing-doc-456",
  resident_id: "R202",
  residence_id: "C3",
  resident_name: "Charlie Brown",
  emergencyContacts: [
    {
      contact_name: "Lucy Brown",
      relationship: "Sister",
      cell_phone: "555-4444",
      home_phone: null,
      work_phone: null,
    },
  ],
};

export const mockTransaction = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const mockResidentDocRefAdd = { id: "new-mutated-doc-id" };
export const mockResidentDocRefUpdate = { id: "existing-doc-456" };
