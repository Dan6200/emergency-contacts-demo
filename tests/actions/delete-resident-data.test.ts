import { collectionWrapper } from "@/firebase/firestore";
import type { Resident } from "@/types/resident";
import { deleteResidentData } from "@/app/admin/residents/data-actions";
import { notFound } from "next/navigation";
import db from "@/firebase/server/config";

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

describe("deleteResidentData", () => {
  const mockDocToDeleteId = "resident-to-delete-doc-123";
  const mockResidentToDeleteData = { resident_id: "R999", residence_id: "Z9" };
  const mockTransaction = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockResidentDocRef = {
    id: mockDocToDeleteId,
    ref: "mock-resident-ref",
  };
  const mockContactDocRef1 = { id: "contact-del-1", ref: "mock-contact-ref-1" };
  const mockContactDocRef2 = { id: "contact-del-2", ref: "mock-contact-ref-2" };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
      await updateFn(mockTransaction);
      return Promise.resolve();
    });

    // Mock resident fetch
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => mockResidentToDeleteData,
      ref: mockResidentDocRef,
    });

    // Mock contacts fetch
    const mockContactsSnap = {
      docs: [
        {
          id: mockContactDocRef1.id,
          data: () => ({}),
          ref: mockContactDocRef1,
        },
        {
          id: mockContactDocRef2.id,
          data: () => ({}),
          ref: mockContactDocRef2,
        },
      ],
      forEach: jest.fn((callback) => {
        mockContactsSnap.docs.forEach(callback);
      }),
    };
    const mockContactsWhereFn = jest.fn().mockReturnThis();
    const mockContactsGetFn = jest.fn().mockResolvedValue(mockContactsSnap);

    (collectionWrapper as jest.Mock).mockImplementation((name) => {
      if (name === "residents") {
        return { doc: jest.fn().mockReturnValue(mockResidentDocRef) };
      }
      if (name === "emergency_contacts") {
        return { where: mockContactsWhereFn, get: mockContactsGetFn };
      }
      return {};
    });
  });

  it("should delete resident and associated contacts within a transaction", async () => {
    const result = await deleteResidentData(mockDocToDeleteId);

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef);
    expect(collectionWrapper("emergency_contacts").where).toHaveBeenCalledWith(
      "resident_id",
      "==",
      mockResidentToDeleteData.resident_id,
    );
    expect(mockTransaction.delete).toHaveBeenCalledTimes(3);
    expect(mockTransaction.delete).toHaveBeenCalledWith(mockResidentDocRef);
    expect(mockTransaction.delete).toHaveBeenCalledWith(mockContactDocRef1);
    expect(mockTransaction.delete).toHaveBeenCalledWith(mockContactDocRef2);
    expect(result).toEqual({ success: true, message: expect.any(String) });
  });

  it("should throw notFound if resident to delete is not found", async () => {
    mockTransaction.get.mockResolvedValue({ exists: false });

    await expect(deleteResidentData(mockDocToDeleteId)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );

    expect(notFound).toHaveBeenCalled();
    expect(mockTransaction.delete).not.toHaveBeenCalled();
  });

  it("should return failure if transaction fails", async () => {
    const error = new Error("Firestore transaction failed");
    (db.runTransaction as jest.Mock).mockRejectedValue(error);

    const result = await deleteResidentData(mockDocToDeleteId);

    expect(db.runTransaction).toHaveBeenCalled();
    expect(result).toEqual({ success: false, message: expect.any(String) });
  });
});
