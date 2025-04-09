import {collectionWrapper} from '@/firebase/firestore';
import type {
	Resident, // Base type fetched from 'residents' collection
	ResidentData, // Type often used in forms/updates, includes contacts
	residentConverter,
	isTypeResident, // Type guard used in getResidentData
} from '@/types/resident';
import type {
	EmergencyContact,
	emergencyContactConverter,
	isTypeEmergencyContact, // Type guard used in getResidentData
} from '@/types/emergency_contacts' // Type fetched from 'emergency_contacts' collection
import type {RoomData} from '@/types/room-data';

// Mock the collectionWrapper function globally
jest.mock('@/firebase/firestore', () => ({
	collectionWrapper: jest.fn(),
}));

// Mock db.runTransaction
jest.mock('@/firebase/server/config', () => ({
	// Mock the default export 'db'
	__esModule: true, // This is important for mocking default exports
	default: {
		runTransaction: jest.fn(async (updateFunction) => {
			// Simulate transaction execution by calling the updateFunction
			// with a mock transaction object.
			const mockTransaction = {
				get: jest.fn(),
				set: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
			};
			// You might need to refine mockTransaction based on specific test needs
			await updateFunction(mockTransaction);
			// Return a resolved promise to simulate successful transaction commit
			return Promise.resolve();
		}),
	},
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
	notFound: jest.fn(() => {
		throw new Error('NEXT_NOT_FOUND'); // Simulate the behavior of notFound
	}),
}));
import {getResidentData} from './data-actions';

// Mock the converters and type guards
jest.mock('@/types/emergency_contacts', () => {
	const originalModule = jest.requireActual('@/types/emergency_contacts');
	return {
		...originalModule,
		// Mock converters to simulate Firestore data transformation
		emergencyContactConverter: {
			toFirestore: (data: EmergencyContact) => data,
			fromFirestore: (snapshot: {id: string; data: () => any}, options: any): EmergencyContact => ({
				// Simulate adding id and returning typed data
				// document_id is NOT part of the core EmergencyContact type from Firestore
				// @ts-ignore
				...(snapshot.data(options) as Omit<EmergencyContact, 'document_id'>),
			}),
		},
		// Mock type guards to always return true for valid mock data,
		// or allow them to run if you want to test their logic implicitly.
		isTypeEmergencyContact: jest.fn((data): data is EmergencyContact => originalModule.isTypeEmergencyContact(data)),
	};
});

jest.mock('@/types/resident', () => {
	const originalModule = jest.requireActual('@/types/resident');
	return {
		...originalModule,
		residentConverter: {
			toFirestore: (data: Resident) => data,
			fromFirestore: (snapshot: {id: string; data: () => any}, options: any): Resident => ({
				// @ts-ignore
				...(snapshot.data(options) as Omit<Resident, 'document_id'>),
			}),
		},
		isTypeResident: jest.fn((data): data is Resident => originalModule.isTypeResident(data)),
	};
});

describe('getResidentData', () => {
	// --- Test Data Setup ---
	const mockDocumentId = 'resident-doc-123';
	const mockResidentDocData: Resident = {
		resident_id: 'R101',
		residence_id: 'A1',
		resident_name: 'John Doe',
	};

	const mockEmergencyContactsData: EmergencyContact[] = [
		{
			resident_id: 'R101',
			residence_id: 'A1',
			contact_name: 'Jane Doe',
			relationship: 'Daughter',
			cell_phone: '555-1112',
			home_phone: '555-1111',
			work_phone: null,
		},
		{
			resident_id: 'R101',
			residence_id: 'A1',
			contact_name: 'Peter Smith',
			relationship: 'Friend',
			cell_phone: '555-2222',
			home_phone: null,
			work_phone: '555-2221',
		},
	];

	// This represents the expected final structure returned by getResidentData
	// It combines Resident data with its document_id and fetched contacts
	const expectedResultData = {
		...mockResidentDocData,
		document_id: mockDocumentId,
		emergencyContacts: mockEmergencyContactsData.map((contact, index) => ({
			...contact,
			// In a real scenario, the document_id would come from Firestore snapshot `id`
			// We simulate this based on the mock setup.
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
		// Simulate QuerySnapshot
		docs: mockEmergencyContactsData.map((contact, index) => ({
			// Simulate QueryDocumentSnapshot
			id: `contact-doc-${index + 1}`, // Simulate document ID from Firestore
			data: jest.fn().mockReturnValue(contact), // Return data matching EmergencyContact type
		})),
	};

	const mockMetadataSnap = {
		exists: true,
		id: 'lastResidentId',
		data: () => ({resident_id: '1000'})
	}

	// Properly scoped mock functions
	const mockMetadataDocFn = jest.fn().mockImplementation((_docId) => {
		return {get: jest.fn().mockResolvedValue(mockMetadataSnap)};
	});

	// Properly scoped mock functions
	const mockResidentsDocFn = jest.fn().mockImplementation((_docId) => {
		return {get: jest.fn().mockResolvedValue(mockResidentSnap)};
	});

	const mockEmergencyContactsWhereFn = jest.fn().mockImplementation(() => {
		return {get: jest.fn().mockResolvedValue(mockContactsSnap)};
	});

	// Consolidated collectionWrapper mock
	(collectionWrapper as jest.Mock).mockImplementation((collectionName: string) => {
		if (collectionName === 'metadata') {
			return {
				doc: mockMetadataDocFn,
			};
		}
		if (collectionName === 'residents') {
			return {
				doc: mockResidentsDocFn,
				withConverter: jest.fn().mockReturnThis(),
			};
		}
		if (collectionName === 'emergency_contacts') {
			return {
				where: mockEmergencyContactsWhereFn,
				withConverter: jest.fn().mockReturnThis(),
			};
		}
		return {
			doc: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			get: jest.fn().mockResolvedValue({docs: [], exists: false}),
			withConverter: jest.fn().mockReturnThis(),
		};
	});

	// Fixed test case structure
	it('should return resident data with contacts', async () => {
		const result = await getResidentData(mockDocumentId);
		expect(result.document_id).toBe(mockDocumentId);
		expect(result.emergencyContacts).toHaveLength(mockEmergencyContactsData.length);
	});

	it('should throw when resident not found', async () => {
		mockResidentSnap.exists = false;
		await expect(getResidentData(mockDocumentId)).rejects.toThrow(/^Failed to fetch resident/);
	});

	// Reset mocks between tests if needed, especially for transaction mocks
	afterEach(() => {
		jest.clearAllMocks();
		// Re-apply the base collectionWrapper mock implementation if cleared
		(collectionWrapper as jest.Mock).mockImplementation((collectionName: string) => {
			if (collectionName === 'residents') {
				return {
					doc: mockResidentsDocFn,
					get: jest.fn().mockResolvedValue(mockResidentSnap), // Default for getResidents
					withConverter: jest.fn().mockReturnThis(),
				};
			}
			if (collectionName === 'emergency_contacts') {
				return {
					where: mockEmergencyContactsWhereFn,
					get: jest.fn().mockResolvedValue(mockContactsSnap), // Default
					withConverter: jest.fn().mockReturnThis(),
				};
			}
			if (collectionName === 'metadata') {
				return {
					doc: jest.fn().mockReturnThis(), // Chainable
					get: jest.fn().mockResolvedValue({docs: [], exists: false}), // Default for addNewResident
					withConverter: jest.fn().mockReturnThis(),
				};
			}
			if (collectionName === 'residence') {
				return {
					doc: jest.fn().mockReturnThis(), // Chainable
					get: jest.fn().mockResolvedValue({docs: [], exists: false}), // Default for getAllRooms/getRoomData
					withConverter: jest.fn().mockReturnThis(),
				};
			}
			// Default fallback
			return {
				doc: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				get: jest.fn().mockResolvedValue({docs: [], exists: false}),
				withConverter: jest.fn().mockReturnThis(),
			};
		});
	});
});

// --- Mocks for other functions ---
// Import necessary functions/types if not already imported
import db from '@/firebase/server/config';
// import {notFound} from 'next/navigation';
import {
	addNewResident,
	updateResident,
} from './data-actions';
// import {
// mutateResidentData,
// getResidents,
// getAllRooms,
// getRoomData,
// deleteResidentData,
// addNewEmergencyContact, // Tested implicitly via addNewResident/updateResident
// } from './data-actions';

// import type {Residence} from '@/types/residence'; // Assuming Residence type exists

// --- Test Data ---
const mockNewResidentData = {
	residence_id: 'B2',
	resident_name: 'Alice Smith',
	// No resident_id initially
	emergencyContacts: [
		{
			contact_name: 'Bob Smith',
			relationship: 'Husband',
			cell_phone: '555-3333',
			home_phone: null, work_phone: null, // Ensure all fields match EmergencyContact (minus resident/residence id)
		},
	],
};

const mockExistingResidentData: ResidentData = {
	document_id: 'existing-doc-456',
	resident_id: 'R202',
	residence_id: 'C3',
	resident_name: 'Charlie Brown',
	emergencyContacts: [
		{
			contact_name: 'Lucy Brown',
			relationship: 'Sister',
			cell_phone: '555-4444',
			home_phone: null, work_phone: null,
		},
	],
};

const mockRoomData: RoomData = {
	document_id: 'room-doc-789',
	residence_id: 'D4',
	address: '123 Main St',
	roomNo: 'D4',
	residents: [{
		document_id: 'existing-doc-456',
		resident_id: 'R202',
		resident_name: 'Charlie Brown',
	}]
};


// --- Tests for addNewResident ---
describe('addNewResident', () => {
	const mockTransaction = {
		get: jest.fn(),
		set: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(), // Not used by addNewResident directly but part of mock
	};

	beforeEach(() => {
		// Reset mocks for each test
		jest.clearAllMocks();
		// Setup default transaction behavior
		(db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
			await updateFn(mockTransaction);
			return Promise.resolve(); // Simulate success
		});
		// Mock metadata fetch
		mockTransaction.get.mockResolvedValue({
			exists: true,
			data: () => ({resident_id: '1000'}), // Last ID
		});
		// Mock collectionWrapper for residents and contacts within the transaction context if needed
		const mockResidentDocRef = {id: 'new-resident-doc-id'}; // Simulate Firestore auto-ID
		const mockContactDocRef = {id: 'new-contact-doc-id'};
		(collectionWrapper as jest.Mock).mockImplementation((collectionName: string) => {
			if (collectionName === 'metadata') return {doc: jest.fn().mockReturnValue({ /* metadata ref */})};
			if (collectionName === 'residents') return {doc: jest.fn().mockReturnValue(mockResidentDocRef)};
			if (collectionName === 'emergency_contacts') return {doc: jest.fn().mockReturnValue(mockContactDocRef), withConverter: jest.fn().mockReturnThis()};
			return {}; // Fallback
		});
	});

	it('should add a new resident and update metadata', async () => {
		const result = await addNewResident(mockNewResidentData);

		expect(db.runTransaction).toHaveBeenCalled();
		expect(mockTransaction.get).toHaveBeenCalledWith(expect.objectContaining({ /* metadata ref */})); // Check metadata get
		expect(mockTransaction.set).toHaveBeenCalledTimes(2); // One for resident, one for contact
		// Check resident data set
		expect(mockTransaction.set).toHaveBeenCalledWith(
			expect.objectContaining({id: 'new-resident-doc-id'}), // Check resident ref
			expect.objectContaining({
				resident_id: '1001', // Incremented ID
				resident_name: mockNewResidentData.resident_name,
				residence_id: mockNewResidentData.residence_id,
			})
		);
		// Check contact data set (implicitly tests addNewEmergencyContact logic)
		expect(mockTransaction.set).toHaveBeenCalledWith(
			expect.objectContaining({id: 'new-contact-doc-id'}), // Check contact ref
			expect.objectContaining({
				...mockNewResidentData.emergencyContacts[0],
				resident_id: '1001', // New resident ID
				residence_id: mockNewResidentData.residence_id, // Resident's residence ID
			})
		);
		expect(mockTransaction.update).toHaveBeenCalledWith(
			expect.objectContaining({ /* metadata ref */}), // Check metadata ref
			{resident_id: '1001'} // Check metadata update
		);
		expect(result).toEqual({success: true, message: expect.any(String)});
	});

	it('should add a resident without emergency contacts', async () => {
		const residentDataNoContacts = {...mockNewResidentData, emergencyContacts: []};
		const result = await addNewResident(residentDataNoContacts);

		expect(db.runTransaction).toHaveBeenCalled();
		expect(mockTransaction.set).toHaveBeenCalledTimes(1); // Only resident set
		expect(mockTransaction.set).toHaveBeenCalledWith(
			expect.objectContaining({id: 'new-resident-doc-id'}),
			expect.objectContaining({resident_id: '1001'})
		);
		expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {resident_id: '1001'});
		expect(result).toEqual({success: true, message: expect.any(String)});
	});

	it('should return failure if metadata is missing', async () => {
		mockTransaction.get.mockResolvedValue({exists: false}); // Simulate metadata not found
		const result = await addNewResident(mockNewResidentData);
		expect(db.runTransaction).toHaveBeenCalled(); // Transaction starts
		// The error happens inside the transaction, leading to rejection
		// We expect the catch block in addNewResident to return the failure object
		expect(result).toEqual({success: false, message: expect.any(String)});
		expect(mockTransaction.set).not.toHaveBeenCalled(); // Should not proceed
		expect(mockTransaction.update).not.toHaveBeenCalled();
	});

	it('should return failure if transaction fails', async () => {
		const error = new Error('Firestore transaction failed');
		(db.runTransaction as jest.Mock).mockRejectedValue(error); // Simulate transaction failure

		const result = await addNewResident(mockNewResidentData);

		expect(db.runTransaction).toHaveBeenCalled();
		expect(result).toEqual({success: false, message: expect.any(String)});
		// Ensure console.error was called (optional)
		// expect(console.error).toHaveBeenCalledWith("Failed to Add a New Resident.", error);
	});
});

// --- Tests for updateResident ---
describe('updateResident', () => {
	const mockTransaction = {
		get: jest.fn(),
		set: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};
	const mockResidentDocRef = {id: mockExistingResidentData.document_id};
	const mockExistingContactDocRef = {id: 'existing-contact-doc-id', ref: 'mock-ref-existing'};
	const mockNewContactDocRef = {id: 'new-contact-doc-id', ref: 'mock-ref-new'};

	beforeEach(() => {
		jest.clearAllMocks();
		(db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
			await updateFn(mockTransaction);
			return Promise.resolve();
		});

		// Mock fetching the resident to be updated
		mockTransaction.get.mockResolvedValue({
			exists: true,
			data: () => ({ // Return minimal data needed for update logic
				resident_id: mockExistingResidentData.resident_id,
				residence_id: mockExistingResidentData.residence_id,
			}),
			ref: mockResidentDocRef, // Include ref if needed by transaction logic
		});

		// Mock fetching existing contacts
		const mockExistingContactsSnap = {
			docs: [{
				exists: true,
				id: mockExistingContactDocRef.id,
				data: () => mockExistingResidentData.emergencyContacts![0],
				ref: mockExistingContactDocRef, // Ref needed for delete
			}],
			forEach: jest.fn((callback) => {
				mockExistingContactsSnap.docs.forEach(callback);
			}),
		};

		// Mock collectionWrapper behavior for updateResident
		(collectionWrapper as jest.Mock).mockImplementation((collectionName: string) => {
			if (collectionName === 'residents') {
				return {
					doc: jest.fn().mockReturnValue(mockResidentDocRef), // Return ref for the specific resident doc
				};
			}
			if (collectionName === 'emergency_contacts') {
				return {
					where: jest.fn().mockReturnThis(), // Chainable
					get: jest.fn().mockResolvedValue(mockExistingContactsSnap), // Return existing contacts
					doc: jest.fn().mockReturnValue(mockNewContactDocRef), // For adding new contacts
					withConverter: jest.fn().mockReturnThis(),
				};
			}
			return {};
		});
	});

	it('should update resident data and handle contacts (delete old, add new)', async () => {
		const updatedData = {
			...mockExistingResidentData,
			resident_name: 'Charlie Brown Updated',
			emergencyContacts: [ // New set of contacts
				// This contact will be added
				{contact_name: 'Snoopy', relationship: 'Pet', cell_phone: '555-5555', home_phone: null, work_phone: null},
			],
		};
		// Prepare the payload according to ResidentData type.
		// Keep resident_id and residence_id as they are part of ResidentData.
		// document_id is passed separately.
		const {document_id, ...updatePayload} = updatedData; // Keep resident_id, residence_id, etc.

		// Ensure the payload matches ResidentData structure
		const validUpdatePayload: ResidentData = {
			resident_id: updatePayload.resident_id,
			residence_id: updatePayload.residence_id,
			resident_name: updatePayload.resident_name,
			emergencyContacts: updatePayload.emergencyContacts,
		};

		const result = await updateResident(validUpdatePayload, mockExistingResidentData.document_id as any); // No 'as any' needed

		expect(db.runTransaction).toHaveBeenCalled();
		expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef); // Fetch resident
		expect(collectionWrapper('emergency_contacts').where).toHaveBeenCalledWith("resident_id", "==", mockExistingResidentData.resident_id); // Query existing contacts
		expect(mockTransaction.delete).toHaveBeenCalledWith(mockExistingContactDocRef); // Delete old contact
		expect(mockTransaction.set).toHaveBeenCalledWith( // Add new contact
			mockNewContactDocRef, // Ref for the new contact ('Snoopy')
			expect.objectContaining({
				contact_name: 'Snoopy',
				cell_phone: '555-5555', // Ensure new contact data is correct
				resident_id: mockExistingResidentData.resident_id, // Should be linked to the correct resident
				residence_id: mockExistingResidentData.residence_id, // Should be linked to the correct residence
			})
		);
		expect(mockTransaction.update).toHaveBeenCalledWith( // Update resident doc
			mockResidentDocRef,
			expect.objectContaining({resident_name: 'Charlie Brown Updated'}) // Check resident name update
		);
		// Ensure emergencyContacts field itself is not written to the resident document
		expect(mockTransaction.update).toHaveBeenCalledWith(
			mockResidentDocRef,
			expect.not.objectContaining({emergencyContacts: expect.anything()})
		);
		expect(result).toEqual({success: true, message: expect.any(String)});
	});
});

// 	it('should update resident data without changing contacts if contacts array is omitted or empty', async () => {
// 		// Create payload without the emergencyContacts field
// 		const {emergencyContacts, document_id, ...basePayload} = mockExistingResidentData;
// 		const updatePayload: ResidentData = { // Ensure type compliance
// 			...basePayload,
// 			resident_name: "Charlie Updated Again",
// 			emergencyContacts: [], // Explicitly empty or null/undefined based on desired behavior
// 		};
//
//
// 		const result = await updateResident(updatePayload, mockExistingResidentData.document_id); // No 'as any'
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef);
// 		expect(collectionWrapper('emergency_contacts').where).not.toHaveBeenCalled(); // No contact query
// 		expect(mockTransaction.delete).not.toHaveBeenCalled();
// 		expect(mockTransaction.set).not.toHaveBeenCalled(); // No contact set
// 		expect(mockTransaction.update).toHaveBeenCalledTimes(1); // Only resident update
// 		expect(mockTransaction.update).toHaveBeenCalledWith(
// 			mockResidentDocRef,
// 			expect.objectContaining({resident_name: 'Charlie Updated Again'})
// 		);
// 		expect(result).toEqual({success: true, message: expect.any(String)});
// 	});
//
//
// 	it('should throw notFound if resident to update is not found', async () => {
// 		mockTransaction.get.mockResolvedValue({exists: false}); // Simulate resident not found
//
// 		// Prepare a valid payload structure even though the resident won't be found
// 		const {document_id, ...updatePayload} = mockExistingResidentData;
// 		const validUpdatePayload: ResidentData = {
// 			resident_id: updatePayload.resident_id,
// 			residence_id: updatePayload.residence_id,
// 			resident_name: updatePayload.resident_name,
// 			emergencyContacts: updatePayload.emergencyContacts,
// 		};
//
// 		// Expect the call to updateResident itself to reject because notFound is thrown inside
// 		await expect(updateResident(validUpdatePayload, mockExistingResidentData.document_id))
// 			.rejects.toThrow('NEXT_NOT_FOUND');
//
// 		// Expect runTransaction to have been called
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		// Check if notFound was called (indirectly, by checking if the mock threw)
// 		expect(notFound).toHaveBeenCalled();
// 		// The function should re-throw or handle the notFound error appropriately.
// 		// Depending on exact implementation, it might return a failure object or let the error propagate.
// 		// Let's assume it catches and returns failure for now.
// 		// **Note:** The actual code throws `notFound`, which Next.js handles.
// 		// In a test environment, we mock `notFound` to throw an error we can catch or expect.
// 		// The test setup above mocks notFound to throw 'NEXT_NOT_FOUND'.
// 		// The `updateResident` function doesn't explicitly catch this, so the transaction likely fails.
// 		// We'll check the failure return object which implies the catch block was hit.
// 		// TODO: Verify exact error propagation if needed. For now, check the return.
// 		// This expectation might need adjustment based on how errors are handled post-transaction.
// 		// Since the error is thrown *inside* the transaction callback, runTransaction itself might reject.
// 		// Let's refine the expectation:
// 		await expect(updateResident(updatePayload as any, mockExistingResidentData.document_id))
// 			.rejects.toThrow('NEXT_NOT_FOUND'); // Expect the notFound error to propagate
//
// 		expect(mockTransaction.update).not.toHaveBeenCalled(); // No update should occur
// 	});
//
// 	it('should return failure if transaction fails', async () => {
// 		const error = new Error('Firestore transaction failed');
// 		(db.runTransaction as jest.Mock).mockRejectedValue(error); // Simulate transaction failure
//
// 		// Prepare a valid payload structure
// 		const {document_id, ...updatePayload} = mockExistingResidentData;
// 		const validUpdatePayload: ResidentData = {
// 			resident_id: updatePayload.resident_id,
// 			residence_id: updatePayload.residence_id,
// 			resident_name: updatePayload.resident_name,
// 			emergencyContacts: updatePayload.emergencyContacts,
// 		};
// 		const result = await updateResident(validUpdatePayload, mockExistingResidentData.document_id); // No 'as any'
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		expect(result).toEqual({success: false, message: expect.any(String)});
// 	});
// });
//
// // --- Tests for mutateResidentData ---
// describe('mutateResidentData', () => {
// 	// We'll mock the functions it calls: addNewResident and updateResident
// 	// Or, rely on the mocks already set up for db.runTransaction etc.
// 	// Let's stick with mocking the transaction logic for consistency.
//
// 	// Mocks will be similar to addNewResident and updateResident tests.
// 	// We need to ensure the correct logic (add vs update) is triggered.
//
// 	const mockTransaction = {get: jest.fn(), set: jest.fn(), update: jest.fn(), delete: jest.fn()};
// 	const mockResidentDocRefAdd = {id: 'new-mutated-doc-id'};
// 	const mockResidentDocRefUpdate = {id: mockExistingResidentData.document_id};
//
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 		(db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
// 			await updateFn(mockTransaction);
// 			return Promise.resolve();
// 		});
//
// 		// Mock metadata for add case
// 		mockTransaction.get.mockResolvedValueOnce({ // Use Once for metadata specific to add
// 			exists: true,
// 			data: () => ({resident_id: '2000'}),
// 		});
// 		// Mock resident get for update case
// 		mockTransaction.get.mockResolvedValueOnce({ // Use Once for resident specific to update
// 			exists: true,
// 			data: () => ({resident_id: mockExistingResidentData.resident_id}),
// 			ref: mockResidentDocRefUpdate,
// 		});
//
// 		// General collectionWrapper mock
// 		(collectionWrapper as jest.Mock).mockImplementation((collectionName: string) => {
// 			if (collectionName === 'metadata') return {doc: jest.fn().mockReturnValue({})};
// 			if (collectionName === 'residents') {
// 				// Return different doc refs based on context (tricky without more state)
// 				// Let's simplify: assume add context first, then update context
// 				return {doc: jest.fn().mockReturnValue(mockResidentDocRefAdd)}; // Default to add scenario ref
// 			}
// 			if (collectionName === 'emergency_contacts') {
// 				return {
// 					where: jest.fn().mockReturnThis(),
// 					get: jest.fn().mockResolvedValue({docs: [], forEach: jest.fn()}), // Default empty contacts
// 					doc: jest.fn().mockReturnValue({id: 'mutated-contact-id'}),
// 					withConverter: jest.fn().mockReturnThis(),
// 				};
// 			}
// 			return {};
// 		});
// 	});
//
// 	it('should call addNewResident logic when residentId is not provided', async () => {
// 		// Reset specific mocks for add scenario
// 		mockTransaction.get.mockReset();
// 		mockTransaction.get.mockResolvedValue({exists: true, data: () => ({resident_id: '2000'})}); // Metadata
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => name === 'residents' ? {doc: jest.fn().mockReturnValue(mockResidentDocRefAdd)} : name === 'metadata' ? {doc: jest.fn().mockReturnValue({})} : {doc: jest.fn().mockReturnValue({}), withConverter: jest.fn().mockReturnThis()});
//
//
// 		const result = await mutateResidentData(mockNewResidentData); // No residentId -> Add
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		// Check for add-specific calls (metadata update, resident set)
// 		expect(mockTransaction.update).toHaveBeenCalledWith(expect.anything(), {resident_id: '2001'});
// 		expect(mockTransaction.set).toHaveBeenCalledWith(mockResidentDocRefAdd, expect.objectContaining({resident_id: '2001'}));
// 		expect(result.success).toBe(true);
// 		expect(result.message).toContain('Added'); // Check message indicative of add
// 	});
//
// 	it('should call updateResident logic when residentId is provided', async () => {
// 		// Reset specific mocks for update scenario
// 		mockTransaction.get.mockReset();
// 		mockTransaction.get.mockResolvedValue({exists: true, data: () => ({resident_id: mockExistingResidentData.resident_id}), ref: mockResidentDocRefUpdate}); // Resident fetch
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => name === 'residents' ? {doc: jest.fn().mockReturnValue(mockResidentDocRefUpdate)} : {where: jest.fn().mockReturnThis(), get: jest.fn().mockResolvedValue({docs: [], forEach: jest.fn()}), doc: jest.fn().mockReturnValue({}), withConverter: jest.fn().mockReturnThis()});
//
//
// 		const result = await mutateResidentData(mockExistingResidentData, mockExistingResidentData.document_id); // residentId -> Update
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		// Check for update-specific calls (resident update)
// 		expect(mockTransaction.update).toHaveBeenCalledWith(mockResidentDocRefUpdate, expect.not.objectContaining({emergencyContacts: expect.anything()}));
// 		// Metadata should not be updated in the update path
// 		expect(mockTransaction.update).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({resident_id: expect.any(String)}));
// 		expect(result.success).toBe(true);
// 		expect(result.message).toContain('Updated'); // Check message indicative of update
// 	});
// });
//
//
// // --- Tests for getResidents ---
// describe('getResidents', () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 		// Setup default mock for collectionWrapper('residents').get()
// 		const mockResidentsSnap = {
// 			docs: [
// 				{id: 'doc1', data: () => ({resident_id: 'R301', residence_id: 'E5', resident_name: 'Resident One'})},
// 				{id: 'doc2', data: () => ({resident_id: 'R302', residence_id: 'E6', resident_name: 'Resident Two'})},
// 			],
// 			size: 2,
// 		};
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => {
// 			if (name === 'residents') {
// 				return {get: jest.fn().mockResolvedValue(mockResidentsSnap)};
// 			}
// 			return {};
// 		});
// 	});
//
// 	it('should return an array of residents', async () => {
// 		const result = await getResidents();
//
// 		expect(collectionWrapper('residents').get).toHaveBeenCalled();
// 		expect(result).toHaveLength(2);
// 		expect(result[0]).toEqual(expect.objectContaining({resident_id: 'R301'}));
// 		expect(result[1]).toEqual(expect.objectContaining({resident_id: 'R302'}));
// 		// Check if type guard was implicitly called (if mocked)
// 		// expect(isTypeResident).toHaveBeenCalledTimes(2);
// 	});
//
// 	it('should return an empty array if no residents found', async () => {
// 		(collectionWrapper('residents').get as jest.Mock).mockResolvedValue({docs: [], size: 0});
// 		const result = await getResidents();
// 		expect(result).toEqual([]);
// 	});
//
// 	it('should throw an error if Firestore fetch fails', async () => {
// 		const error = new Error('Firestore error');
// 		(collectionWrapper('residents').get as jest.Mock).mockRejectedValue(error);
// 		await expect(getResidents()).rejects.toThrow(/^Failed to fetch All Residents Data/);
// 	});
//
// 	it('should throw an error if data does not match Resident type', async () => {
// 		const invalidDataSnap = {
// 			docs: [{id: 'doc1', data: () => ({invalid_field: 'some value'})}], // Missing required fields
// 			size: 1,
// 		};
// 		(collectionWrapper('residents').get as jest.Mock).mockResolvedValue(invalidDataSnap);
// 		// Mock type guard to return false
// 		jest.mocked(require('@/types/resident').isTypeResident).mockReturnValue(false);
//
// 		await expect(getResidents()).rejects.toThrow(/Object is not of type Resident/);
//
// 		// Restore mock
// 		jest.mocked(require('@/types/resident').isTypeResident).mockRestore();
// 	});
// });
//
// // --- Tests for getAllRooms ---
// describe('getAllRooms', () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 		const mockRoomsSnap = {
// 			docs: [
// 				{id: 'room1', data: () => ({residence_id: 'A1', address: '1 Main St', city: 'CityA', state: 'ST', zip: '11111'})},
// 				{id: 'room2', data: () => ({residence_id: 'B2', address: '2 Oak Ave', city: 'CityB', state: 'ST', zip: '22222'})},
// 			],
// 			size: 2,
// 		};
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => {
// 			if (name === 'residence') {
// 				return {get: jest.fn().mockResolvedValue(mockRoomsSnap)};
// 			}
// 			return {};
// 		});
// 	});
//
// 	it('should return an array of rooms with document_id', async () => {
// 		const result = await getAllRooms();
//
// 		expect(collectionWrapper('residence').get).toHaveBeenCalled();
// 		expect(result).toHaveLength(2);
// 		expect(result[0]).toEqual(expect.objectContaining({document_id: 'room1', residence_id: 'A1'}));
// 		expect(result[1]).toEqual(expect.objectContaining({document_id: 'room2', residence_id: 'B2'}));
// 	});
//
// 	it('should throw notFound if no rooms are found', async () => {
// 		(collectionWrapper('residence').get as jest.Mock).mockResolvedValue({docs: [], size: 0});
// 		await expect(getAllRooms()).rejects.toThrow('NEXT_NOT_FOUND'); // Check for the error thrown by our notFound mock
// 		expect(notFound).toHaveBeenCalled();
// 	});
//
// 	it('should throw an error if Firestore fetch fails', async () => {
// 		const error = new Error('Firestore error');
// 		(collectionWrapper('residence').get as jest.Mock).mockRejectedValue(error);
// 		await expect(getAllRooms()).rejects.toThrow(/^Failed to fetch All Room Data/);
// 	});
//
// 	it('should throw an error if data does not match Residence type', async () => {
// 		const invalidDataSnap = {
// 			docs: [{id: 'room1', data: () => ({invalid_field: 'some value'})}],
// 			size: 1,
// 		};
// 		(collectionWrapper('residence').get as jest.Mock).mockResolvedValue(invalidDataSnap);
// 		jest.mocked(require('@/types/resident').isTypeResidence).mockReturnValue(false);
//
// 		await expect(getAllRooms()).rejects.toThrow(/Object is not of type Residence/);
//
// 		jest.mocked(require('@/types/resident').isTypeResidence).mockRestore();
// 	});
// });
//
//
// // --- Tests for getRoomData ---
// describe('getRoomData', () => {
// 	const mockRoomDocId = 'room-doc-789';
// 	const mockRoomDocData = {residence_id: 'D4', address: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345'};
// 	const mockResidentsInRoomData = [
// 		{document_id: 'res-doc-1', resident_id: 'R401', residence_id: 'D4', resident_name: 'Resident Alpha'},
// 		{document_id: 'res-doc-2', resident_id: 'R402', residence_id: 'D4', resident_name: 'Resident Beta'},
// 	];
//
// 	beforeEach(() => {
// 		jest.clearAllMocks();
//
// 		// Mock room fetch
// 		const mockRoomSnap = {
// 			exists: true,
// 			id: mockRoomDocId,
// 			data: () => mockRoomDocData,
// 		};
// 		const mockRoomDocFn = jest.fn().mockResolvedValue(mockRoomSnap);
//
// 		// Mock residents fetch
// 		const mockResidentsSnap = {
// 			docs: mockResidentsInRoomData.map(res => ({
// 				exists: true,
// 				id: res.document_id,
// 				data: () => ({resident_id: res.resident_id, residence_id: res.residence_id, resident_name: res.resident_name}), // Exclude doc_id from data()
// 			})),
// 			size: mockResidentsInRoomData.length,
// 		};
// 		const mockResidentsWhereFn = jest.fn().mockReturnThis(); // For where()
// 		const mockResidentsGetFn = jest.fn().mockResolvedValue(mockResidentsSnap); // For get()
//
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => {
// 			if (name === 'residence') {
// 				return {doc: jest.fn(() => ({get: mockRoomDocFn}))}; // doc(id).get()
// 			}
// 			if (name === 'residents') {
// 				return {where: mockResidentsWhereFn, get: mockResidentsGetFn}; // where().get()
// 			}
// 			return {};
// 		});
// 	});
//
// 	it('should return room data joined with resident data', async () => {
// 		const result = await getRoomData(mockRoomDocId);
//
// 		expect(collectionWrapper('residence').doc).toHaveBeenCalledWith(mockRoomDocId);
// 		expect(collectionWrapper('residents').where).toHaveBeenCalledWith('residence_id', '==', mockRoomDocData.residence_id);
// 		expect(result).toBeDefined();
// 		expect(result.document_id).toBe(mockRoomDocId);
// 		expect(result.address).toBe(mockRoomDocData.address);
// 		expect(result.residents).toHaveLength(mockResidentsInRoomData.length);
// 		expect(result.residents[0]).toEqual(expect.objectContaining({document_id: 'res-doc-1', resident_id: 'R401'}));
// 		expect(result.residents[1]).toEqual(expect.objectContaining({document_id: 'res-doc-2', resident_id: 'R402'}));
// 		// Ensure residence_id is NOT in the nested resident objects returned
// 		expect(result.residents[0]).not.toHaveProperty('residence_id');
// 	});
//
// 	it('should return room data with null residents if none found', async () => {
// 		(collectionWrapper('residents').get as jest.Mock).mockResolvedValue({docs: [], size: 0}); // No residents found
//
// 		const result = await getRoomData(mockRoomDocId);
//
// 		expect(result).toBeDefined();
// 		expect(result.document_id).toBe(mockRoomDocId);
// 		expect(result.residents).toBeNull(); // Check for null as per implementation
// 	});
//
//
// 	it('should throw notFound if room document does not exist', async () => {
// 		(collectionWrapper('residence').doc(mockRoomDocId).get as jest.Mock).mockResolvedValue({exists: false});
// 		await expect(getRoomData(mockRoomDocId)).rejects.toThrow('NEXT_NOT_FOUND');
// 		expect(notFound).toHaveBeenCalled();
// 	});
//
// 	it('should throw an error if room data is not of type Residence', async () => {
// 		(collectionWrapper('residence').doc(mockRoomDocId).get as jest.Mock).mockResolvedValue({
// 			exists: true, id: mockRoomDocId, data: () => ({invalid: 'data'})
// 		});
// 		jest.mocked(require('@/types/resident').isTypeResidence).mockReturnValue(false);
//
// 		await expect(getRoomData(mockRoomDocId)).rejects.toThrow(/Object is not of type Residence/);
//
// 		jest.mocked(require('@/types/resident').isTypeResidence).mockRestore();
// 	});
//
// 	it('should throw an error if resident data is not of type Resident', async () => {
// 		// Keep room data valid, make resident data invalid
// 		(collectionWrapper('residents').get as jest.Mock).mockResolvedValue({
// 			docs: [{exists: true, id: 'res-doc-1', data: () => ({invalid: 'resident'})}], size: 1
// 		});
// 		jest.mocked(require('@/types/resident').isTypeResident).mockReturnValue(false);
//
// 		await expect(getRoomData(mockRoomDocId)).rejects.toThrow(/Object is not of type Resident/);
//
// 		jest.mocked(require('@/types/resident').isTypeResident).mockRestore();
// 	});
//
// 	// TODO: Add test for duplicate resident error if necessary (depends on how data could become duplicated)
//
// 	it('should throw an error if Firestore fetch fails', async () => {
// 		const error = new Error('Firestore error');
// 		(collectionWrapper('residence').doc(mockRoomDocId).get as jest.Mock).mockRejectedValue(error);
// 		await expect(getRoomData(mockRoomDocId)).rejects.toThrow(/^Failed to fetch All Residents Data/); // Error message from getRoomData's catch block
// 	});
// });
//
//
// // --- Tests for deleteResidentData ---
// describe('deleteResidentData', () => {
// 	const mockDocToDeleteId = 'resident-to-delete-doc-123';
// 	const mockResidentToDeleteData = {resident_id: 'R999', residence_id: 'Z9'};
// 	const mockTransaction = {get: jest.fn(), set: jest.fn(), update: jest.fn(), delete: jest.fn()};
// 	const mockResidentDocRef = {id: mockDocToDeleteId, ref: 'mock-resident-ref'};
// 	const mockContactDocRef1 = {id: 'contact-del-1', ref: 'mock-contact-ref-1'};
// 	const mockContactDocRef2 = {id: 'contact-del-2', ref: 'mock-contact-ref-2'};
//
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 		(db.runTransaction as jest.Mock).mockImplementation(async (updateFn) => {
// 			await updateFn(mockTransaction);
// 			return Promise.resolve();
// 		});
//
// 		// Mock resident fetch
// 		mockTransaction.get.mockResolvedValue({
// 			exists: true,
// 			data: () => mockResidentToDeleteData,
// 			ref: mockResidentDocRef, // Ref needed for delete
// 		});
//
// 		// Mock contacts fetch
// 		const mockContactsSnap = {
// 			docs: [
// 				{id: mockContactDocRef1.id, data: () => ({}), ref: mockContactDocRef1},
// 				{id: mockContactDocRef2.id, data: () => ({}), ref: mockContactDocRef2},
// 			],
// 			forEach: jest.fn((callback) => {
// 				mockContactsSnap.docs.forEach(callback);
// 			}),
// 		};
// 		const mockContactsWhereFn = jest.fn().mockReturnThis();
// 		const mockContactsGetFn = jest.fn().mockResolvedValue(mockContactsSnap);
//
// 		(collectionWrapper as jest.Mock).mockImplementation((name) => {
// 			if (name === 'residents') {
// 				return {doc: jest.fn().mockReturnValue(mockResidentDocRef)};
// 			}
// 			if (name === 'emergency_contacts') {
// 				return {where: mockContactsWhereFn, get: mockContactsGetFn};
// 			}
// 			return {};
// 		});
// 	});
//
// 	it('should delete resident and associated contacts within a transaction', async () => {
// 		const result = await deleteResidentData(mockDocToDeleteId);
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		expect(mockTransaction.get).toHaveBeenCalledWith(mockResidentDocRef); // Fetch resident
// 		expect(collectionWrapper('emergency_contacts').where).toHaveBeenCalledWith('resident_id', '==', mockResidentToDeleteData.resident_id); // Query contacts
// 		expect(mockTransaction.delete).toHaveBeenCalledTimes(3); // 1 resident + 2 contacts
// 		expect(mockTransaction.delete).toHaveBeenCalledWith(mockResidentDocRef); // Delete resident
// 		expect(mockTransaction.delete).toHaveBeenCalledWith(mockContactDocRef1); // Delete contact 1
// 		expect(mockTransaction.delete).toHaveBeenCalledWith(mockContactDocRef2); // Delete contact 2
// 		expect(result).toEqual({success: true, message: expect.any(String)});
// 	});
//
// 	it('should throw notFound if resident to delete is not found', async () => {
// 		mockTransaction.get.mockResolvedValue({exists: false}); // Simulate not found
//
// 		// Similar to updateResident, expect notFound to be called and throw
// 		await expect(deleteResidentData(mockDocToDeleteId))
// 			.rejects.toThrow('NEXT_NOT_FOUND');
//
// 		expect(notFound).toHaveBeenCalled();
// 		expect(mockTransaction.delete).not.toHaveBeenCalled(); // Nothing should be deleted
// 	});
//
// 	it('should return failure if transaction fails', async () => {
// 		const error = new Error('Firestore transaction failed');
// 		(db.runTransaction as jest.Mock).mockRejectedValue(error);
//
// 		const result = await deleteResidentData(mockDocToDeleteId);
//
// 		expect(db.runTransaction).toHaveBeenCalled();
// 		expect(result).toEqual({success: false, message: expect.any(String)});
// 		// expect(console.error).toHaveBeenCalledWith("Failed to Delete the Resident.", error);
// 	});
// });
