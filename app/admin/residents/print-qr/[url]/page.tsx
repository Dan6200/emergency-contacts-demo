import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function PrintQR({
  params: { url: urlString },
}: {
  params: { url: string };
}) {
  // this function will generate PDF with QR
  const url = decodeURIComponent(urlString);
  return (
    <main className="bg-background flex items-center justify-center container w-full py-32 md:w-2/3 max-h-screen">
      <Link href={url}>
        <QRCodeSVG value={url} size={500} />
      </Link>
    </main>
  );
}
