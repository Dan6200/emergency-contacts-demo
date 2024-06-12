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

export const collectionWrapper = (
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
) => {
  try {
    return <CollectionReference<Resident>>(
      collection(firestore, path, ...pathSegments)
    );
  } catch (err) {
    return new Error("creating collection :\n" + err);
  }
};

export const addDocWrapper = async (
  reference: CollectionReference<any, DocumentData>,
  data: any
) => {
  return addDoc(reference, data).catch((err) => {
    throw new Error("Error adding document:\n" + err);
  });
};

export const getDocWrapper = async (
  ref: DocumentReference<unknown, DocumentData>
) => {
  return getDoc(ref).catch((err) => {
    throw new Error("Error retrieving document:\n" + err);
  });
};

export const getDocsWrapper = async (query: Query<unknown, DocumentData>) => {
  return getDocs(query).catch((err) => {
    if (err instanceof Error)
      throw new Error("Error retrieving all documents:\n" + err.message);
  });
};

export function docWrapper(
  firestore: Firestore,
  path: string,
  ...pathSegments: string[]
) {
  try {
    return doc(firestore, path, ...pathSegments);
  } catch (err) {
    return new Error("Error getting document reference:\n" + err);
  }
}

export const updateDocWrapper = async (
  reference: DocumentReference<unknown, any>,
  data: any
) => {
  return updateDoc(reference, data).catch((err) => {
    throw new Error("Error updating document:\n" + err);
  });
};

export const deleteDocWrapper = async (
  reference: DocumentReference<unknown, DocumentData>
) => {
  return deleteDoc(reference).catch((err) => {
    throw new Error("Error deleting document:\n" + err);
  });
};

export const queryWrapper = (_query: Query<Resident, DocumentData>) => {
  try {
    return query(_query);
  } catch (e) {
    return new Error("Error querying the Database:\n" + e);
  }
};
