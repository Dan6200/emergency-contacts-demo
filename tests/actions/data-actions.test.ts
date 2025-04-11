// import { collectionWrapper } from "@/firebase/firestore";
// import type {
//   Resident, // Base type fetched from 'residents' collection
//   ResidentData, // Type often used in forms/updates, includes contacts
//   residentConverter,
//   isTypeResident, // Type guard used in getResidentData
// } from "@/types/resident";
// import type {
//   EmergencyContact,
//   emergencyContactConverter,
//   isTypeEmergencyContact, // Type guard used in getResidentData
// } from "@/types/emergency_contacts"; // Type fetched from 'emergency_contacts' collection
// import type { RoomData } from "@/types/room-data";
//
// // Mock the collectionWrapper function globally
// jest.mock("@/firebase/firestore", () => ({
//   collectionWrapper: jest.fn(),
// }));
//
// // Mock db.runTransaction
// jest.mock("@/firebase/server/config", () => ({
//   // Mock the default export 'db'
//   __esModule: true, // This is important for mocking default exports
//   default: {
//     runTransaction: jest.fn(async (updateFunction) => {
//       // Simulate transaction execution by calling the updateFunction
//       // with a mock transaction object.
//       const mockTransaction = {
//         get: jest.fn(),
//         set: jest.fn(),
//         update: jest.fn(),
//         delete: jest.fn(),
//       };
//       // You might need to refine mockTransaction based on specific test needs
//       await updateFunction(mockTransaction);
//       // Return a resolved promise to simulate successful transaction commit
//       return Promise.resolve();
//     }),
//   },
// }));
//
// // Mock next/navigation
// jest.mock("next/navigation", () => ({
//   notFound: jest.fn(() => {
//     throw new Error("NEXT_NOT_FOUND"); // Simulate the behavior of notFound
//   }),
// }));
// import { getResidentData } from "@/app/admin/residents/data-actions";
//
// // Mock the converters and type guards
// jest.mock("@/types/emergency_contacts", () => {
//   const originalModule = jest.requireActual("@/types/emergency_contacts");
//   return {
//     ...originalModule,
//     // Mock converters to simulate Firestore data transformation
//     emergencyContactConverter: {
//       toFirestore: (data: EmergencyContact) => data,
//       fromFirestore: (
//         snapshot: { id: string; data: () => any },
//         options: any,
//       ): EmergencyContact => ({
//         // Simulate adding id and returning typed data
//         // document_id is NOT part of the core EmergencyContact type from Firestore
//         // @ts-ignore
//         ...(snapshot.data(options) as Omit<EmergencyContact, "document_id">),
//       }),
//     },
//     // Mock type guards to always return true for valid mock data,
//     // or allow them to run if you want to test their logic implicitly.
//     isTypeEmergencyContact: jest.fn((data): data is EmergencyContact =>
//       originalModule.isTypeEmergencyContact(data),
//     ),
//   };
// });
//
// jest.mock("@/types/resident", () => {
//   const originalModule = jest.requireActual("@/types/resident");
//   return {
//     ...originalModule,
//     residentConverter: {
//       toFirestore: (data: Resident) => data,
//       fromFirestore: (
//         snapshot: { id: string; data: () => any },
//         options: any,
//       ): Resident => ({
//         // @ts-ignore
//         ...(snapshot.data(options) as Omit<Resident, "document_id">),
//       }),
//     },
//     isTypeResident: jest.fn((data): data is Resident =>
//       originalModule.isTypeResident(data),
//     ),
//   };
// });
//
// // --- Mocks for other functions ---
// // Import necessary functions/types if not already imported
// import db from "@/firebase/server/config";
// import { notFound } from "next/navigation";
// import {
//   addNewResident,
//   updateResident,
// } from "@/app/admin/residents/data-actions";
// import {
//   mutateResidentData,
//   getResidents,
//   getAllRooms,
//   getRoomData,
//   deleteResidentData,
//   addNewEmergencyContact, // Tested implicitly via addNewResident/updateResident
// } from "@/app/admin/residents/data-actions";
//
// import type { Residence } from "@/types/residence"; // Assuming Residence type exists
