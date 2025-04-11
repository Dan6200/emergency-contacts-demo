import { collectionWrapper } from "@/firebase/firestore";
import type { ResidentData } from "@/types/resident";
// import type { EmergencyContact } from "@/types/emergency_contacts";
import db from "@/firebase/server/config";
import { updateResident } from "@/app/admin/residents/data-actions";

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

import { notFound } from "next/navigation";

describe("updateResident", () => {
  const mockExistingResidentData: ResidentData & { document_id: string } = {
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

  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockResidentDocRef = { id: mockExistingResidentData.document_id };
  const mockExistingContactDocRef = {
    id: "existing-contact-doc-id",
    ref: "mock-ref-existing",
  };
  const mockNewContactDocRef = {
    id: "new-contact-doc-id",
    ref: "mock-ref-new",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
      await updateFn(mockTransaction);
      return Promise.resolve();
    });

    // Mock fetching the resident to be updated
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({
        resident_id: mockExistingResidentData.resident_id,
        residence_id: mockExistingResidentData.residence_id,
      }),
      ref: mockResidentDocRef,
    });

    // Mock fetching existing contacts
    const mockExistingContactsSnap = {
      docs: [
        {
          exists: true,
          id: mockExistingContactDocRef.id,
          data: () => mockExistingResidentData.emergencyContacts![0],
          ref: mockExistingContactDocRef,
        },
      ],
      forEach: jest.fn((callback) => {
        mockExistingContactsSnap.docs.forEach(callback);
      }),
    };

    // Mock collectionWrapper behavior for updateResident
    (collectionWrapper as jest.Mock).mockImplementation(
      (collectionName: string) => {
        if (collectionName === "residents") {
          return {
            doc: jest.fn().mockReturnValue(mockResidentDocRef),
          };
        }
        if (collectionName === "emergency_contacts") {
          return {
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue(mockExistingContactsSnap),
            doc: jest.fn().mockReturnValue(mockNewContactDocRef),
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        return {};
      },
    );
  });

  it("should update resident data and handle contacts (delete old, add new)", async () => {
    const updatedData = {
      ...mockExistingResidentData,
      resident_name: "Charlie Brown Updated",
      emergencyContacts: [
        {
          contact_name: "Snoopy",
          relationship: "Pet",
          cell_phone: "555-5555",
          home_phone: null,
          work_phone: null,
        },
      ],
    };
    const { document_id, ...updatePayload } = updatedData;
    const validUpdatePayload: ResidentData = {
      resident_id: updatePayload.resident_id,
      residence_id: updatePayload.residence_id,
      resident_name: updatePayload.resident_name,
      emergencyContacts: updatePayload.emergencyContacts,
    };

    const result = await updateResident(
      validUpdatePayload,
      mockExistingResidentData.document_id as any,
    );

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef);
    expect(collectionWrapper("emergency_contacts").where).toHaveBeenCalledWith(
      "resident_id",
      "==",
      mockExistingResidentData.resident_id,
    );
    expect(mockTransaction.delete).toHaveBeenCalledWith(
      mockExistingContactDocRef,
    );
    expect(mockTransaction.set).toHaveBeenCalledWith(
      mockNewContactDocRef,
      expect.objectContaining({
        contact_name: "Snoopy",
        cell_phone: "555-5555",
        resident_id: mockExistingResidentData.resident_id,
        residence_id: mockExistingResidentData.residence_id,
      }),
    );
    expect(mockTransaction.update).toHaveBeenCalledWith(
      mockResidentDocRef,
      expect.objectContaining({ resident_name: "Charlie Brown Updated" }),
    );
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("should update resident data without changing contacts if contacts array is omitted or empty", async () => {
    // Create payload without the emergencyContacts field
    const { emergencyContacts, document_id, ...basePayload } =
      mockExistingResidentData;
    const updatePayload: ResidentData = {
      // Ensure type compliance
      ...basePayload,
      resident_name: "Charlie Updated Again",
      emergencyContacts: [], // Explicitly empty or null/undefined based on desired behavior
    };

    const result = await updateResident(
      updatePayload,
      mockExistingResidentData.document_id,
    ); // No 'as any'

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef);
    expect(
      collectionWrapper("emergency_contacts").where,
    ).not.toHaveBeenCalled(); // No contact query
    expect(mockTransaction.delete).not.toHaveBeenCalled();
    expect(mockTransaction.set).not.toHaveBeenCalled(); // No contact set
    expect(mockTransaction.update).toHaveBeenCalledTimes(1); // Only resident update
    expect(mockTransaction.update).toHaveBeenCalledWith(
      mockResidentDocRef,
      expect.objectContaining({ resident_name: "Charlie Updated Again" }),
    );
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("should throw notFound if resident to update is not found", async () => {
    mockTransaction.get.mockResolvedValue({ exists: false }); // Simulate resident not found

    // Prepare a valid payload structure even though the resident won't be found
    const { document_id, ...updatePayload } = mockExistingResidentData;
    const validUpdatePayload: ResidentData = {
      resident_id: updatePayload.resident_id,
      residence_id: updatePayload.residence_id,
      resident_name: updatePayload.resident_name,
      emergencyContacts: updatePayload.emergencyContacts,
    };

    // Expect the call to updateResident itself to reject because notFound is thrown inside
    await expect(
      updateResident(validUpdatePayload, mockExistingResidentData.document_id),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    // Expect runTransaction to have been called
    expect(db.runTransaction).toHaveBeenCalled();
    // Check if notFound was called (indirectly, by checking if the mock threw)
    expect(notFound).toHaveBeenCalled();
    // The function should re-throw or handle the notFound error appropriately.
    // Depending on exact implementation, it might return a failure object or let the error propagate.
    // Let's assume it catches and returns failure for now.
    // **Note:** The actual code throws `notFound`, which Next.js handles.
    // In a test environment, we mock `notFound` to throw an error we can catch or expect.
    // The test setup above mocks notFound to throw 'NEXT_NOT_FOUND'.
    // The `updateResident` function doesn't explicitly catch this, so the transaction likely fails.
    // We'll check the failure return object which implies the catch block was hit.
    // TODO: Verify exact error propagation if needed. For now, check the return.
    // This expectation might need adjustment based on how errors are handled post-transaction.
    // Since the error is thrown *inside* the transaction callback, runTransaction itself might reject.
    // Let's refine the expectation:
    await expect(
      updateResident(
        updatePayload as any,
        mockExistingResidentData.document_id,
      ),
    ).rejects.toThrow("NEXT_NOT_FOUND"); // Expect the notFound error to propagate

    expect(mockTransaction.update).not.toHaveBeenCalled(); // No update should occur
  });

  it("should return failure if transaction fails", async () => {
    const error = new Error("Firestore transaction failed");
    (db.runTransaction as jest.Mock).mockRejectedValue(error); // Simulate transaction failure

    // Prepare a valid payload structure
    const { document_id, ...updatePayload } = mockExistingResidentData;
    const validUpdatePayload: ResidentData = {
      resident_id: updatePayload.resident_id,
      residence_id: updatePayload.residence_id,
      resident_name: updatePayload.resident_name,
      emergencyContacts: updatePayload.emergencyContacts,
    };
    const result = await updateResident(
      validUpdatePayload,
      mockExistingResidentData.document_id,
    ); // No 'as any'

    expect(db.runTransaction).toHaveBeenCalled();
    expect(result).toEqual({ success: false, message: expect.any(String) });
  });
});
