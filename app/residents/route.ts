import db from "@/firebase/config";
import { collectionWrapper, getDocsWrapper } from "@/firebase/firestore";
import { query } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  const [resErr, resRef] = collectionWrapper(db, "residents");
  if (resRef === null) throw new Error("could not access database");
  const q = query(resRef);
  const [err, residents] = await getDocsWrapper(q);
  if (residents === null) throw new Error("Could not fetch data");
  return NextResponse.json(
    residents.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }))
  );
}
