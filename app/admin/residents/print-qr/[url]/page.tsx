"use client";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useLayoutEffect } from "react";
import jsPDF from "jspdf";
import { svgToPngDataURL } from "@/app/utils";

export default function PrintQR({
  params: { url: urlString },
}: {
  params: { url: string };
}) {
  useLayoutEffect(() => {
    (async () => {
      const qrSvg = document.querySelector("#qrSvg");
      const pdf = new jsPDF();
      const pngDataUrl = await svgToPngDataURL(qrSvg!);
      if (pngDataUrl) pdf.addImage(pngDataUrl as string, 30, 50, 150, 150);
      setTimeout(() => pdf.save("Residents Qr Codes.pdf"), 250);
    })();
  }, []);
  const url = decodeURIComponent(urlString);
  return (
    <main className="bg-background flex items-center justify-center container w-full py-32 md:w-2/3 max-h-screen">
      <Link href={url}>
        <QRCodeSVG id="qrSvg" value={url} size={500} className="w-[80vw]" />
      </Link>
    </main>
  );
}
