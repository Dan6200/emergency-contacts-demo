import { collectionWrapper } from "@/firebase/firestore";
import type { ResidentData } from "@/types/resident";
import db from "@/firebase/server/config";
import { mutateResidentData } from "@/app/admin/residents/data-actions";
import { notFound } from "next/navigation";
import {
  mockNewResidentData,
  mockExistingResidentData,
  mockTransaction,
  mockResidentDocRefAdd,
  mockResidentDocRefUpdate,
} from "./__mocks__/test-data";

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

describe("mutateResidentData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
      await updateFn(mockTransaction);
      return Promise.resolve();
    });

    // Mock metadata for add case
    mockTransaction.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ resident_id: "2000" }),
    });
    // Mock resident get for update case
    mockTransaction.get.mockResolvedValueOnce({
      exists: true,
      data: () => ({ resident_id: mockExistingResidentData.resident_id }),
      ref: mockResidentDocRefUpdate,
    });

    // General collectionWrapper mock
    (collectionWrapper as jest.Mock).mockImplementation(
      (collectionName: string) => {
        if (collectionName === "metadata")
          return { doc: jest.fn().mockReturnValue({}) };
        if (collectionName === "residents") {
          return { doc: jest.fn().mockReturnValue(mockResidentDocRefAdd) };
        }
        if (collectionName === "emergency_contacts") {
          return {
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ docs: [], forEach: jest.fn() }),
            doc: jest.fn().mockReturnValue({ id: "mutated-contact-id" }),
            withConverter: jest.fn().mockReturnThis(),
          };
        }
        return {};
      },
    );
  });

  it("should call addNewResident logic when residentId is not provided", async () => {
    // Reset specific mocks for add scenario
    mockTransaction.get.mockReset();
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ resident_id: "2000" }),
    }); // Metadata
    (collectionWrapper as jest.Mock).mockImplementation((name) =>
      name === "residents"
        ? { doc: jest.fn().mockReturnValue(mockResidentDocRefAdd) }
        : name === "metadata"
          ? { doc: jest.fn().mockReturnValue({}) }
          : {
              doc: jest.fn().mockReturnValue({}),
              withConverter: jest.fn().mockReturnThis(),
            },
    );

    const result = await mutateResidentData(mockNewResidentData); // No residentId -> Add

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {
      resident_id: "2001",
    });
    expect(mockTransaction.set).toHaveBeenCalledWith(
      mockResidentDocRefAdd,
      expect.objectContaining({ resident_id: "2001" }),
    );
    expect(result.success).toBe(true);
    expect(result.message).toContain("Added");
  });

  it("should call updateResident logic when residentId is provided", async () => {
    // Reset specific mocks for update scenario
    mockTransaction.get.mockReset();
    mockTransaction.get.mockResolvedValue({
      exists: true,
      data: () => ({ resident_id: mockExistingResidentData.resident_id }),
      ref: mockResidentDocRefUpdate,
    }); // Resident fetch
    (collectionWrapper as jest.Mock).mockImplementation((name) =>
      name === "residents"
        ? { doc: jest.fn().mockReturnValue(mockResidentDocRefUpdate) }
        : {
            where: jest.fn().mockReturnThis(),
            get: jest.fn().mockResolvedValue({ docs: [], forEach: jest.fn() }),
            doc: jest.fn().mockReturnValue({}),
            withConverter: jest.fn().mockReturnThis(),
          },
    );

    const result = await mutateResidentData(
      mockExistingResidentData,
      mockExistingResidentData.document_id,
    ); // residentId -> Update

    expect(db.runTransaction).toHaveBeenCalled();
    expect(mockTransaction.update).toHaveBeenCalledWith(
      mockResidentDocRefUpdate,
      expect.not.objectContaining({ emergencyContacts: expect.anything() }),
    );
    expect(mockTransaction.update).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ resident_id: expect.any(String) }),
    );
    expect(result.success).toBe(true);
    expect(result.message).toContain("Updated");
  });
});
