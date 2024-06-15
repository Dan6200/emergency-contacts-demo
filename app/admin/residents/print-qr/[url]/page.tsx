import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import Link from "next/link";

export default function PrintQR({
  params: { url: urlString },
}: {
  params: { url: string };
}) {
  // this function will generate PDF with QR
  const url = decodeURIComponent(urlString);
  return (
    <main className="bg-background flex items-center container w-full py-32 md:w-2/3 mx-auto max-h-screen">
      <Link href={url}>
        <QRCodeSVG value={url} size={500} />
      </Link>
    </main>
  );
}
