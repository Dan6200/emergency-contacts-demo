import { notFound, redirect } from "next/navigation";
import {
  addNewResident,
  getRoomData,
} from "@/app/admin/residents/data-actions";
import Room from "@/components/room";
import { isTypeRoomData } from "@/types/resident";
import util from "node:util";

export default async function RoomPage({
  params: { id },
}: {
  params: { id: string };
}) {
  console.log(id);
  const roomData = await getRoomData(id).catch((e) => {
    if (e.message.match(/not_found/i)) throw notFound();
    if (e.message.match(/insufficient permissions/)) redirect("/admin/sign-in");
    throw new Error(
      `Unable to pass props to Resident Component -- Tag:22.\n\t${e}`
    );
  });
  console.log(util.inspect(roomData, false, null, true));
  if (!isTypeRoomData(roomData)) throw new Error("Invalid Room Data");
  return <Room {...{ roomData }}></Room>;
}
