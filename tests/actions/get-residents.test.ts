import { collectionWrapper } from "@/firebase/firestore";
import type { Resident } from "@/types/resident";
import { getResidents } from "@/app/admin/residents/data-actions";

// Mock the collectionWrapper function globally
jest.mock("@/firebase/firestore", () => ({
  collectionWrapper: jest.fn(),
}));

//  Note: Don't use actual type guard for unit tests,
//  ...mock the appropriate response and then test type
//  ...guards separately
// jest.mock("@/types/resident", () => {
//   const originalModule = jest.requireActual("@/types/resident");
//   return {
//     ...originalModule,
//     isTypeResident: jest.fn((data): data is Resident => {
//       return originalModule.isTypeResident(data);
//     }),
//   };
// });

describe("getResidents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock for collectionWrapper('residents').get()
    const mockResidentsSnap = {
      docs: [
        {
          id: "doc1",
          data: () => ({
            resident_id: "R301",
            residence_id: "E5",
            resident_name: "Resident One",
          }),
        },
        {
          id: "doc2",
          data: () => ({
            resident_id: "R302",
            residence_id: "E6",
            resident_name: "Resident Two",
          }),
        },
      ],
      size: 2,
    };

    const mockGet = jest.fn().mockResolvedValue(mockResidentsSnap);
    const mockWithConverter = jest.fn().mockReturnThis();

    (collectionWrapper as jest.Mock).mockImplementation((name) => {
      if (name === "residents") {
        return {
          get: mockGet,
          withConverter: mockWithConverter,
        };
      }
      return {};
    });
  });

  it("should return an array of residents", async () => {
    const result = await getResidents();

    expect(collectionWrapper("residents").get).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expect.objectContaining({ resident_id: "R301" }));
    expect(result[0]).toEqual(expect.objectContaining({ residence_id: "E5" }));
    expect(result[1]).toEqual(expect.objectContaining({ resident_id: "R302" }));
    expect(result[1]).toEqual(
      expect.objectContaining({ resident_name: "Resident Two" }),
    );
  });

  it("should return an empty array if no residents found", async () => {
    (collectionWrapper("residents").get as jest.Mock).mockResolvedValue({
      docs: [],
      size: 0,
    });
    const result = await getResidents();
    expect(result).toEqual([]);
  });

  it("should throw an error if Firestore fetch fails", async () => {
    const error = new Error("Firestore error");
    (collectionWrapper("residents").get as jest.Mock).mockRejectedValue(error);
    await expect(getResidents()).rejects.toThrow(
      /^Failed to fetch All Residents Data/,
    );
  });

  // Keep the global mock for the converter module, as getResidents imports it.
  const mockConverter = {
    toFirestore: jest.fn(),
    fromFirestore: jest.fn().mockImplementation(() => {
      // This mock implementation might not even be called with the new approach,
      // but it doesn't hurt to keep it defined.
      throw new Error("Converter failed: Invalid data");
    }),
  };
  jest.mock("@/types/resident", () => ({
    ...jest.requireActual("@/types/resident"),
    residentConverter: mockConverter, // Inject the mock converter
  }));

  it("should throw an error if the type conversion fails", async () => {
    // 1. Simulate the snapshot structure returned by .get()
    const mockDocSnapshotWithError = {
      id: "doc1",
      // 2. Mock the .data() method on the document snapshot to throw an error.
      // This simulates the scenario where the fromFirestore converter fails
      // when getResidents calls doc.data() during its .map() operation.
      data: jest.fn().mockImplementation(() => {
        console.log("Simulated doc.data() throwing error..."); // For debugging
        throw new Error("Simulated converter failure via doc.data()"); // Does not pass if commented out? Why?
      }),
      // Add other snapshot properties if needed by the code under test
      exists: true,
      ref: {} as any, // Mock ref if necessary
      createTime: undefined,
      updateTime: undefined,
      readTime: undefined,
    };
    const snapshotWithProblematicDoc = {
      docs: [mockDocSnapshotWithError],
      size: 1,
      empty: false,
      forEach: (callback: any) => [mockDocSnapshotWithError].forEach(callback),
      // Add other QuerySnapshot properties if needed
      query: {} as any,
      docChanges: () => [],
    };

    // 3. Mock the chain: collectionWrapper -> withConverter -> get
    const mockGet = jest.fn().mockResolvedValue(snapshotWithProblematicDoc);
    const mockWithConverter = jest.fn().mockReturnValue({ get: mockGet });
    (collectionWrapper as jest.Mock).mockReturnValue({
      withConverter: mockWithConverter,
      // Add other methods like .doc() if needed by other tests, or handle in beforeEach
    });

    // 4. Call the function and assert rejection
    console.log("Calling getResidents() for error test..."); // For debugging
    await expect(getResidents()).rejects.toThrow(
      /^Failed to fetch All Residents Data/, // Matches the error from the catch block in getResidents
    );

    // 5. Verify mocks
    // Ensure withConverter was called (implicitly uses the mocked residentConverter)
    expect(mockWithConverter).toHaveBeenCalled();
    // Ensure .get() was called on the object returned by withConverter
    expect(mockGet).toHaveBeenCalled();
    // Ensure the problematic data() function was called by getResidents' map
    expect(mockDocSnapshotWithError.data).toHaveBeenCalled();
  });
});
