import { getAllRooms } from "@/app/admin/residents/data-actions";
import { Residence, Resident } from "@/types/resident";
import jsPDF from "jspdf";
import { NextResponse } from "next/server";
import logo from "./logo";
import QRcode from "qrcode";

// Add base64 for the logo if you want it embedded
// You can convert the logo into base64 using an online tool and place the result here

export const dynamic = "force-dynamic";
export async function GET() {
  const rooms = await getAllRooms().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:24.\n\t" + e);
  });

  const doc = new jsPDF();

  await Promise.all(
    rooms
      .slice(0, 10)
      .map(
        async (
          { id, residence_id, roomNo, address }: Residence & { id: string },
          idx
        ) => {
          const qrCodeDataUri = await QRcode.toDataURL(
            new URL(`/room/${id}/`, process.env.DOMAIN).toString()
          );

          // Add the LinkID logo at the top
          doc.addImage(logo, "PNG", 77, 60, 55, 20); // Adjust dimensions and position as needed

          // Add the resident information title
          doc.setFontSize(20);
          doc.setFont("Helvetica", "bold"); // Styling
          doc.text("RESIDENT INFORMATION - SCAN TO REVEAL", 37, 90); // Adjust position
          doc.setFont("Helvetica", "normal");

          // Add the QR code
          doc.setLineWidth(8);
          doc.setDrawColor(255, 0, 0);
          doc.rect(75, 100, 60, 60);
          doc.addImage(qrCodeDataUri, "PNG", 75, 100, 60, 60); // Centered below text
          doc.setFont("Helvetica", "bold"); // Styling
          doc.text("INSTANT ACCESS TO EMERGENCY INFO", 45, 183); // Adjust position
          let street = address
            .match(/^[A-Za-z ]+(?=\s\d)/gm)
            ?.join(" ")
            .toUpperCase();

          if (!street)
            throw new Error(
              "Please provide the street name to address: " + address
            );
          const streetRaw = street.split(" ");
          const regex = /^(?!.*(ROAD|STREET|RD|ST|DRIVE|WAY)).+$/;
          const streetName = streetRaw.filter((word) => regex.test(word));

          doc.setFontSize(16);
          doc.setFont("Helvetica", "normal");
          doc.text(streetName.join(""), 75, 173); // Adjust position
          doc.text("-", 112, 173); // Adjust position
          doc.text("#" + roomNo, 120, 173); // Adjust position

          // Draw arrows pointing to the QR code
          // Arrow from left
          //doc.line(60, 90, 75, 100); // Arrowhead - left side
          //doc.line(65, 60, 70, 75); // Arrowhead - left side

          // Arrow from bottom
          //doc.line(60, 140, 90, 100); // First line for the arrow
          //doc.line(60, 140, 63, 137); // Arrowhead - left side
          //doc.line(60, 140, 63, 143); // Arrowhead - right side

          if (idx < rooms.length - 1) doc.addPage(); // Add new page for next resident
        }
      )
  );

  return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'attachment; filename="Residents Qr Codes.pdf"',
    },
  });
}
//import { getAllResidentsDataLite } from "@/app/admin/residents/data";
//import { Resident } from "@/types/resident";
//import jsPDF from "jspdf";
//import { NextResponse } from "next/server";
//import QRcode from "qrcode";
//
//export const dynamic = "force-dynamic";
//export async function GET() {
//  const AllResidents = await getAllResidentsDataLite().catch((e) => {
//    throw new Error("Failed to Retrieve Residents Data -- Tag:24.\n\t" + e);
//  });
//  const doc = new jsPDF();
//  await Promise.all(
//    AllResidents.map(async ({ id, address, unit_number }: Resident, idx) => {
//      const qrCodeDataUri = await QRcode.toDataURL(
//        new URL(`/residents/${id}`, process.env.DOMAIN).toString()
//      );
//      doc.text(`Unit Number: ${unit_number}`, 30, 20);
//      doc.text(`Address: ${address}`, 30, 35);
//      doc.addImage(qrCodeDataUri, "PNG", 30, 75, 150, 150);
//      if (idx < AllResidents.length - 1) doc.addPage();
//    })
//  );
//  return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
//    headers: {
//      "content-type": "application/pdf",
//      "content-disposition": 'attachment; filename="Residents Qr Codes.pdf"',
//    },
//  });
//}
