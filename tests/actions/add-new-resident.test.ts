import { collectionWrapper } from "@/firebase/firestore";
import db from "@/firebase/server/config";
import { addNewResident } from "@/app/admin/residents/data-actions";

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

// --- Test Data ---
const mockNewResidentData = {
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

describe("addNewResident", () => {
  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
      await updateFn(mockTransaction);
      return Promise.resolve();
    });

    // Mock metadata fetch
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ resident_id: "1000" }),
    });

    // Mock collectionWrapper for residents and contacts
    const mockResidentDocRef = { id: "new-resident-doc-id" };
    const mockContactDocRef = { id: "new-contact-doc-id" };
    const mockMetadataDocRef = { id: "lastResidentId" };
    (collectionWrapper as jest.Mock).mockImplementation(
      (collectionName: string) => {
        if (collectionName === "metadata")
          return { doc: jest.fn().mockReturnValue(mockMetadataDocRef) };
        if (collectionName === "residents")
          return {
            doc: jest.fn().mockReturnValue(mockResidentDocRef),
            withConverter: jest.fn().mockReturnThis(),
          };
        if (collectionName === "emergency_contacts")
          return {
            doc: jest.fn().mockReturnValue(mockContactDocRef),
            withConverter: jest.fn().mockReturnThis(),
          };
        return {};
      },
    );
  });

  it("should add a new resident and update metadata", async () => {
    const result = await addNewResident(mockNewResidentData);
    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.get).toHaveBeenCalledWith(
      expect.objectContaining({ id: "lastResidentId" }),
    );
    expect(mockTransaction.set).toHaveBeenCalledTimes(2);
    expect(mockTransaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-resident-doc-id" }),
      expect.objectContaining({
        resident_id: "1001",
        resident_name: mockNewResidentData.resident_name,
        residence_id: mockNewResidentData.residence_id,
      }),
    );
    expect(mockTransaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-contact-doc-id" }),
      expect.objectContaining({
        ...mockNewResidentData.emergencyContacts[0],
        resident_id: "1001",
        residence_id: mockNewResidentData.residence_id,
      }),
    );
    expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
      resident_id: "1001",
    });
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("should add a resident without emergency contacts", async () => {
    const residentDataNoContacts = {
      ...mockNewResidentData,
      emergencyContacts: [],
    };
    const result = await addNewResident(residentDataNoContacts);

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.set).toHaveBeenCalledTimes(1);
    expect(mockTransaction.set).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new-resident-doc-id" }),
      expect.objectContaining({ resident_id: "1001" }),
    );
    expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
      resident_id: "1001",
    });
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("should return failure if metadata is missing", async () => {
    mockTransaction.get.mockResolvedValue({ exists: false });
    const result = await addNewResident(mockNewResidentData);
    expect(db.runTransaction).toHaveBeenCalled();
    expect(result).toEqual({ success: false, message: expect.any(String) });
    expect(mockTransaction.set).not.toHaveBeenCalled();
    expect(mockTransaction.update).not.toHaveBeenCalled();
  });

  it("should return failure if transaction fails", async () => {
    const error = new Error("Firestore transaction failed");
    (db.runTransaction as jest.Mock).mockRejectedValue(error);

    const result = await addNewResident(mockNewResidentData);

    expect(db.runTransaction).toHaveBeenCalled();
    expect(result).toEqual({ success: false, message: expect.any(String) });
  });
});
