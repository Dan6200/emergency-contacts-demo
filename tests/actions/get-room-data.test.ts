import { collectionWrapper } from "@/firebase/firestore";
import type { Residence } from "@/types/residence";
import { getRoomData } from "@/app/admin/residents/data-actions";
import { notFound } from "next/navigation";

// Mock the collectionWrapper function globally
jest.mock("@/firebase/firestore", () => ({
  collectionWrapper: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock the type guard for Residence
jest.mock("@/types/residence", () => ({
  isTypeResidence: jest.fn((data): data is Residence => true),
}));

describe("getRoomData", () => {
  const mockRoomDocId = "room-doc-789";
  const mockRoomDocData = {
    residence_id: "D4",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  };
  const mockResidentsInRoomData = [
    {
      document_id: "res-doc-1",
      resident_id: "R401",
      residence_id: "D4",
      resident_name: "Resident Alpha",
    },
    {
      document_id: "res-doc-2",
      resident_id: "R402",
      residence_id: "D4",
      resident_name: "Resident Beta",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock room fetch
    const mockRoomSnap = {
      exists: true,
      id: mockRoomDocId,
      data: () => mockRoomDocData,
    };
    const mockRoomDocFn = jest.fn().mockResolvedValue(mockRoomSnap);

    // Mock residents fetch
    const mockResidentsSnap = {
      docs: mockResidentsInRoomData.map((res) => ({
        exists: true,
        id: res.document_id,
        data: () => ({
          resident_id: res.resident_id,
          residence_id: res.residence_id,
          resident_name: res.resident_name,
        }), // Exclude doc_id from data()
      })),
      size: mockResidentsInRoomData.length,
    };
    const mockResidentsWhereFn = jest.fn().mockReturnThis(); // For where()
    const mockResidentsGetFn = jest.fn().mockResolvedValue(mockResidentsSnap); // For get()

    (collectionWrapper as jest.Mock).mockImplementation((name) => {
      if (name === "residence") {
        return { doc: jest.fn(() => ({ get: mockRoomDocFn })) }; // doc(id).get()
      }
      if (name === "residents") {
        return { where: mockResidentsWhereFn, get: mockResidentsGetFn }; // where().get()
      }
      return {};
    });
  });

  it("should return room data joined with resident data", async () => {
    const result = await getRoomData(mockRoomDocId);

    expect(collectionWrapper("residence").doc).toHaveBeenCalledWith(
      mockRoomDocId,
    );
    expect(collectionWrapper("residents").where).toHaveBeenCalledWith(
      "residence_id",
      "==",
      mockRoomDocData.residence_id,
    );
    expect(result).toBeDefined();
    expect(result.document_id).toBe(mockRoomDocId);
    expect(result.address).toBe(mockRoomDocData.address);
    expect(result.residents).toHaveLength(mockResidentsInRoomData.length);
    expect(result.residents?.[0]).toEqual(
      expect.objectContaining({
        document_id: "res-doc-1",
        resident_id: "R401",
      }),
    );
    expect(result.residents?.[1]).toEqual(
      expect.objectContaining({
        document_id: "res-doc-2",
        resident_id: "R402",
      }),
    );
    // Ensure residence_id is NOT in the nested resident objects returned
    expect(result.residents?.[0]).not.toHaveProperty("residence_id");
  });

  it("should return room data with null residents if none found", async () => {
    (collectionWrapper("residents").get as jest.Mock).mockResolvedValue({
      docs: [],
      size: 0,
    }); // No residents found

    const result = await getRoomData(mockRoomDocId);

    expect(result).toBeDefined();
    expect(result.document_id).toBe(mockRoomDocId);
    expect(result.residents).toBeNull(); // Check for null as per implementation
  });

  it("should throw notFound if room document does not exist", async () => {
    (
      collectionWrapper("residence").doc(mockRoomDocId).get as jest.Mock
    ).mockResolvedValue({ exists: false });
    await expect(getRoomData(mockRoomDocId)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("should throw an error if room data is not of type Residence", async () => {
    (
      collectionWrapper("residence").doc(mockRoomDocId).get as jest.Mock
    ).mockResolvedValue({
      exists: true,
      id: mockRoomDocId,
      data: () => ({ invalid: "data" }),
    });
    jest
      .mocked(require("@/types/resident").isTypeResidence)
      .mockReturnValue(false);

    await expect(getRoomData(mockRoomDocId)).rejects.toThrow(
      /Object is not of type Residence/,
    );

    jest.mocked(require("@/types/resident").isTypeResidence).mockRestore();
  });

  it("should throw an error if resident data is not of type Resident", async () => {
    // Keep room data valid, make resident data invalid
    (collectionWrapper("residents").get as jest.Mock).mockResolvedValue({
      docs: [
        {
          exists: true,
          id: "res-doc-1",
          data: () => ({ invalid: "resident" }),
        },
      ],
      size: 1,
    });
    jest
      .mocked(require("@/types/resident").isTypeResident)
      .mockReturnValue(false);

    await expect(getRoomData(mockRoomDocId)).rejects.toThrow(
      /Object is not of type Resident/,
    );

    jest.mocked(require("@/types/resident").isTypeResident).mockRestore();
  });

  // TODO: Add test for duplicate resident error if necessary (depends on how data could become duplicated)

  it("should throw an error if Firestore fetch fails", async () => {
    const error = new Error("Firestore error");
    (
      collectionWrapper("residence").doc(mockRoomDocId).get as jest.Mock
    ).mockRejectedValue(error);
    await expect(getRoomData(mockRoomDocId)).rejects.toThrow(
      /^Failed to fetch All Residents Data/,
    ); // Error message from getRoomData's catch block
  });
});
