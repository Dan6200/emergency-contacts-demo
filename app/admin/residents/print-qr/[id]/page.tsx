import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";

export const printQR = ({ id }: { id: string }) => {
  // this funtion will generate PDF with QR
  /*
  const generatePdf = (qrCodeURL: string) => {
    var doc = new jsPDF("landscape", "mm", "a4");
    doc.addImage(qrCodeURL, "JPEG", 145, 35, 110, 110);
    doc.text("Reg. No. : " + regNo, 20, 55);
    doc.text("Vehi. Type  : " + vehiType, 20, 75);
    doc.save("qr.pdf");
  };
	 */
  return <QRCodeSVG value={id} />;
};
