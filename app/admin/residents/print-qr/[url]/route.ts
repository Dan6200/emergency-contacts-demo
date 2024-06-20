import jsPDF from "jspdf";
import { NextResponse } from "next/server";
import QRcode from "qrcode";

export async function GET(
  _req: Request,
  { params: { url } }: { params: { url: string } }
) {
  const doc = new jsPDF();
  const qrCodeDataUri = await QRcode.toDataURL(url);
  doc.addImage(qrCodeDataUri, "PNG", 30, 50, 150, 150);
  return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="Residents Qr Code.pdf"',
    },
  });
}
