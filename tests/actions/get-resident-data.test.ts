import { collectionWrapper } from "@/firebase/firestore";
import type { Resident } from "@/types/resident";
import type { EmergencyContact } from "@/types/emergency_contacts";
import { getResidentData } from "@/app/admin/residents/data-actions";
// import db from "@/firebase/server/config";
// import { notFound } from "next/navigation";

// Mock the collectionWrapper function globally
jest.mock("@/firebase/firestore", () => ({
  collectionWrapper: jest.fn(),
}));

// Mock db.runTransaction
jest.mock("@/firebase/server/config", () => ({
  __esModule: true,
  default: {
    runTransaction: jest.fn(async (updateFunction) => {
      const mockTransaction = {
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
      await updateFunction(mockTransaction);
      return Promise.resolve();
    }),
  },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock the converters and type guards
jest.mock("@/types/emergency_contacts", () => {
  const originalModule = jest.requireActual("@/types/emergency_contacts");
  return {
    ...originalModule,
    emergencyContactConverter: {
      toFirestore: (data: EmergencyContact) => data,
      fromFirestore: (
        snapshot: { id: string; data: (options?: any) => any },
        options: any,
      ): EmergencyContact => ({
        ...(snapshot.data(options) as Omit<EmergencyContact, "document_id">),
      }),
    },
    isTypeEmergencyContact: jest.fn((data): data is EmergencyContact =>
      originalModule.isTypeEmergencyContact(data),
    ),
  };
});

jest.mock("@/types/resident", () => {
  const originalModule = jest.requireActual("@/types/resident");
  return {
    ...originalModule,
    residentConverter: {
      toFirestore: (data: Resident) => data,
      fromFirestore: (
        snapshot: { id: string; data: (options?: any) => any },
        options: any,
      ): Resident => ({
        ...(snapshot.data(options) as Omit<Resident, "document_id">),
      }),
    },
    isTypeResident: jest.fn((data): data is Resident =>
      originalModule.isTypeResident(data),
    ),
  };
});

// --- Test Data Setup ---
const mockDocumentId = "resident-doc-123";
const mockResidentDocData: Resident = {
  resident_id: "R101",
  residence_id: "A1",
  resident_name: "John Doe",
};

const mockEmergencyContactsData: EmergencyContact[] = [
  {
    resident_id: "R101",
    residence_id: "A1",
    contact_name: "Jane Doe",
    relationship: "Daughter",
    cell_phone: "555-1112",
    home_phone: "555-1111",
    work_phone: null,
  },
  {
    resident_id: "R101",
    residence_id: "A1",
    contact_name: "Peter Smith",
    relationship: "Friend",
    cell_phone: "555-2222",
    home_phone: null,
    work_phone: "555-2221",
  },
];

// This represents the expected final structure returned by getResidentData
const expectedResultData = {
  ...mockResidentDocData,
  document_id: mockDocumentId,
  emergencyContacts: mockEmergencyContactsData.map((contact, index) => ({
    ...contact,
    document_id: `contact-doc-${index + 1}`,
  })),
};

// Fixed mock implementations
const mockResidentSnap = {
  exists: true,
  id: mockDocumentId,
  data: jest.fn().mockReturnValue(mockResidentDocData),
};

const mockContactsSnap = {
  docs: mockEmergencyContactsData.map((contact, index) => ({
    id: `contact-doc-${index + 1}`,
    data: jest.fn().mockReturnValue(contact),
  })),
};

const mockMetadataSnap = {
  exists: true,
  id: "lastResidentId",
  data: () => ({ resident_id: "1000" }),
};

// Properly scoped mock functions
const mockMetadataDocFn = jest.fn().mockImplementation((_docId) => {
  return { get: jest.fn().mockResolvedValue(mockMetadataSnap) };
});

const mockResidentsDocFn = jest.fn().mockImplementation((_docId) => {
  return { get: jest.fn().mockResolvedValue(mockResidentSnap) };
});

const mockEmergencyContactsWhereFn = jest.fn().mockImplementation(() => {
  return { get: jest.fn().mockResolvedValue(mockContactsSnap) };
});

// Consolidated collectionWrapper mock
(collectionWrapper as jest.Mock).mockImplementation(
  (collectionName: string) => {
    if (collectionName === "metadata") {
      return {
        doc: mockMetadataDocFn,
      };
    }
    if (collectionName === "residents") {
      return {
        doc: mockResidentsDocFn,
        withConverter: jest.fn().mockReturnThis(),
      };
    }
    if (collectionName === "emergency_contacts") {
      return {
        where: mockEmergencyContactsWhereFn,
        withConverter: jest.fn().mockReturnThis(),
      };
    }
    return {
      doc: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [], exists: false }),
      withConverter: jest.fn().mockReturnThis(),
    };
  },
);

describe("getResidentData", () => {
  // Fixed test case structure
  it("should return resident data with contacts", async () => {
    const result = await getResidentData(mockDocumentId);
    expect(result.document_id).toBe(mockDocumentId);
    expect(result.emergencyContacts).toHaveLength(
      mockEmergencyContactsData.length,
    );
  });

  it("should throw when resident not found", async () => {
    mockResidentSnap.exists = false;
    await expect(getResidentData(mockDocumentId)).rejects.toThrow(
      /^Failed to fetch resident/,
    );
  });

  // Reset mocks between tests if needed, especially for transaction mocks
  afterEach(() => {
    jest.clearAllMocks();
    // Re-apply the base collectionWrapper mock implementation if cleared
    (collectionWrapper as jest.Mock).mockImplementation(
      (collectionName: string) => {
        if (collectionName === "residents") {
          return {
            doc: mockResidentsDocFn,
            get: jest.fn().mockResolvedValue(mockResidentSnap), // Default for getResidents
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        if (collectionName === "emergency_contacts") {
          return {
            where: mockEmergencyContactsWhereFn,
            get: jest.fn().mockResolvedValue(mockContactsSnap), // Default
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        if (collectionName === "metadata") {
          return {
            doc: jest.fn().mockReturnThis(), // Chainable
            get: jest.fn().mockResolvedValue({ docs: [], exists: false }), // Default for addNewResident
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        if (collectionName === "residence") {
          return {
            doc: jest.fn().mockReturnThis(), // Chainable
            get: jest.fn().mockResolvedValue({ docs: [], exists: false }), // Default for getAllRooms/getRoomData
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        // Default fallback
        return {
          doc: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ docs: [], exists: false }),
          withConverter: jest.fn().mockReturnThis(),
        };
      },
    );
  });
});
