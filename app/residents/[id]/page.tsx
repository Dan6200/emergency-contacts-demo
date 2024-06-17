import Resident from "@/components/resident";
import { notFound } from "next/navigation";
import {
  getAllResidentsData,
  getResidentData,
  deleteResidentData,
} from "../functions";
import DeleteResident from "./delete";

export default async function ResidentPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const resident = await getResidentData(id).catch((e) => {
    if (e.message.match(/not_found/i)) throw notFound();
    throw new Error(
      `Unable to pass props to Resident Component -- Tag:22.\n\t${e}`
    );
  });
  return (
    <Resident {...{ resident }}>
      <DeleteResident {...{ id, residentData: resident, deleteResidentData }} />
    </Resident>
  );
}

/*
export async function generateStaticParams() {
  return await getAllResidentsData().catch((e) => {
    throw new Error("Failed To Generate Static Pages -- Tag:12.\n\t" + e);
  });
}
	*/
