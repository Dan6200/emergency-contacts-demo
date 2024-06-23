import { getAllResidentsDataLite } from "@/app/admin/residents/data";
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
    AllResidents.map(async ({ id, address, unit_number }: Resident, idx) => {
      const qrCodeDataUri = await QRcode.toDataURL(
        new URL(`/residents/${id}`, process.env.DOMAIN).toString()
      );
      doc.text(`Unit Number: ${unit_number}`, 30, 20);
      doc.text(`Address: ${address}`, 30, 35);
      doc.addImage(qrCodeDataUri, "PNG", 30, 75, 150, 150);
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
