//cspell:ignore firestore
import { Resident } from "@/types/resident";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Firestore,
  CollectionReference,
  DocumentData,
  Query,
  query,
  DocumentReference,
  getDoc,
} from "firebase/firestore";

export const collectionWrapper = async (
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
) => {
  try {
    return <CollectionReference<Resident>>(
      collection(firestore, path, ...pathSegments)
    );
  } catch (e) {
    throw new Error(`Could not retrieve the ${path} Collection.\n\t` + e);
  }
};

export const addDocWrapper = async (
  reference: CollectionReference<any, DocumentData>,
  data: any
) => {
  return addDoc(reference, data).catch((err) => {
    throw new Error("Error adding document.\n\t" + err);
  });
};

export const getDocWrapper = async (
  ref: DocumentReference<unknown, DocumentData>
) => {
  return getDoc(ref).catch((err) => {
    throw new Error("Error retrieving document.\n\t" + err);
  });
};

export const getDocsWrapper = async (query: Query<unknown, DocumentData>) => {
  return getDocs(query).catch((err) => {
    throw new Error("Error retrieving all documents.\n\t" + err);
  });
};

export async function docWrapper(
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
) {
  try {
    return doc(firestore, path, ...pathSegments);
  } catch (e) {
    throw new Error(`Error retrieving the ${path} Document.\n\t` + e);
  }
}

export const updateDocWrapper = async (
  reference: DocumentReference<unknown, any>,
  data: any
) => {
  return updateDoc(reference, data).catch((err) => {
    throw new Error("Error updating document.\n\t" + err);
  });
};

export const deleteDocWrapper = async (
  reference: DocumentReference<unknown, DocumentData>
) => {
  return deleteDoc(reference).catch((err) => {
    throw new Error("Error deleting document.\n\t" + err);
  });
};

export const queryWrapper = async (_query: Query<Resident, DocumentData>) => {
  try {
    return query(_query);
  } catch (e) {
    throw new Error("Error querying the Database.\n\t" + e);
  }
};
