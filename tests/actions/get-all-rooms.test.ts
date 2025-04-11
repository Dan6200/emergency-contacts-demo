import { collectionWrapper } from "@/firebase/firestore";
import type { Residence } from "@/types/residence";
import { getAllRooms } from "@/app/admin/residents/data-actions";
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

describe("getAllRooms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockRoomsSnap = {
      docs: [
        {
          id: "room1",
          data: () => ({
            residence_id: "A1",
            address: "1 Main St",
            city: "CityA",
            state: "ST",
            zip: "11111",
          }),
        },
        {
          id: "room2",
          data: () => ({
            residence_id: "B2",
            address: "2 Oak Ave",
            city: "CityB",
            state: "ST",
            zip: "22222",
          }),
        },
      ],
      size: 2,
    };
    (collectionWrapper as jest.Mock).mockImplementation((name) => {
      if (name === "residence") {
        return { get: jest.fn().mockResolvedValue(mockRoomsSnap) };
      }
      return {};
    });
  });

  it("should return an array of rooms with document_id", async () => {
    const result = await getAllRooms();

    expect(collectionWrapper("residence").get).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({ document_id: "room1", residence_id: "A1" }),
    );
    expect(result[1]).toEqual(
      expect.objectContaining({ document_id: "room2", residence_id: "B2" }),
    );
  });

  it("should throw notFound if no rooms are found", async () => {
    (collectionWrapper("residence").get as jest.Mock).mockResolvedValue({
      docs: [],
      size: 0,
    });
    await expect(getAllRooms()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("should throw an error if Firestore fetch fails", async () => {
    const error = new Error("Firestore error");
    (collectionWrapper("residence").get as jest.Mock).mockRejectedValue(error);
    await expect(getAllRooms()).rejects.toThrow(
      /^Failed to fetch All Room Data/,
    );
  });

  it("should throw an error if data does not match Residence type", async () => {
    const invalidDataSnap = {
      docs: [{ id: "room1", data: () => ({ invalid_field: "some value" }) }],
      size: 1,
    };
    (collectionWrapper("residence").get as jest.Mock).mockResolvedValue(
      invalidDataSnap,
    );
    jest
      .mocked(require("@/types/residence").isTypeResidence)
      .mockReturnValue(false);

    await expect(getAllRooms()).rejects.toThrow(
      /Object is not of type Residence/,
    );

    jest.mocked(require("@/types/residence").isTypeResidence).mockRestore();
  });
});
