import { getAllResidentsDataLite } from "@/app/residents/functions";
import { Resident } from "@/types/resident";
import jsPDF from "jspdf";
import { NextResponse } from "next/server";
import QRcode from "qrcode";

export const dynamic = "force-dynamic";
export async function GET() {
  const AllResidents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:24.\n\t" + e);
  });
  const doc = new jsPDF();
  await Promise.all(
    AllResidents.map(async ({ id }: Resident, idx) => {
      const qrCodeDataUri = await QRcode.toDataURL(
        new URL(`/residents/${id}`, process.env.NEXT_PUBLIC_DOMAIN).toString()
      );
      doc.addImage(qrCodeDataUri, "PNG", 30, 50, 150, 150);
      if (idx < AllResidents.length - 1) doc.addPage();
    })
  );
  return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="Residents Qr Codes.pdf"',
    },
  });
}
