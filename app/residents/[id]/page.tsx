import Resident from "@/components/resident";
import db from "@/firebase/config";
import {
  collectionWrapper,
  docWrapper,
  getDocsWrapper,
} from "@/firebase/firestore";
import { Query } from "firebase/firestore";

export default function ResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const [docErr, resDoc] = docWrapper(db, "residents", id);
  if (docErr || !resDoc) throw new Error(docErr!);
  return <Resident {...{ resDoc }} />;
}

export async function generateStaticParams() {
  const [colError, colRef] = collectionWrapper(db, "residents");
  if (colError) throw new Error(colError);
  const [qErr, qSnapshot] = await getDocsWrapper(colRef as Query);
  if (qErr || !qSnapshot) throw new Error(qErr!);
  return qSnapshot.docs.map((doc) => doc);
}
