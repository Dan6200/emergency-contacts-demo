import Resident from "@/components/resident";
import { getAllResidentsData, getResidentData } from "../data";

export default async function ResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const resident = await getResidentData(id).catch((e) => {
    throw new Error(`Unable to pass props to Resident Component:\n\t${e}`);
  });
  return <Resident {...{ resident }} />;
}

export async function generateStaticParams() {
  return getAllResidentsData().catch((e) => {
    throw new Error("Failed To Generate Static Pages.\n\t", e);
  });
}
