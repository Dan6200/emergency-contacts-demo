import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

export default function PrintQR({
  params: { id },
}: {
  params: { id: string };
}) {
  // this function will generate PDF with QR
  /*
  const generatePdf = (qrCodeURL: string) => {
    var doc = new jsPDF("landscape", "mm", "a4");
    doc.addImage(qrCodeURL, "JPEG", 145, 35, 110, 110);
    doc.text("Reg. No. : " + regNo, 20, 55);
    doc.text("Vehi. Type  : " + vehiType, 20, 75);
    doc.save("qr.pdf");
  };
	 */
  console.log(id);
  const url = decodeURIComponent(id);
  return (
    <main className="bg-background flex items-center container w-full my-8 md:w-2/3 mx-auto md:my-16 max-h-screen">
      <QRCodeSVG value={url} size={500} />
    </main>
  );
}
