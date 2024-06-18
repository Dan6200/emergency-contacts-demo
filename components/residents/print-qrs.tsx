//cspell:ignore jspdf qrcode svgs
"use client";
import { svgToPngDataURL } from "@/app/utils";
import { Resident } from "@/types/resident";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useLayoutEffect, useEffect } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

const PrintQRs = ({ AllResidents }: { AllResidents: Resident[] }) => {
  useLayoutEffect(() => {
    toast({ title: "This may take a moment..." });
    setTimeout(async () => {
      const qrSvgs = Array.from(document.querySelectorAll(".qrSvg"));
      const pdf = new jsPDF();
      Promise.all(
        qrSvgs.map(async (svg, idx) => {
          const pngDataUrl = await svgToPngDataURL(svg!);
          if (pngDataUrl) {
            pdf.addImage(pngDataUrl as string, 30, 50, 150, 150);
            if (idx < qrSvgs.length - 1) pdf.addPage();
          }
        })
      ).then((_) => pdf.save("Residents Qr Codes.pdf"));
    }, 1000);
  }, []);

  return (
    <main className="bg-background flex items-center justify-center container w-full py-32 md:w-2/3">
      <section className="flex flex-col gap-8 sm:gap-32 md:gap-32 lg:gap-48">
        {AllResidents.map(({ id }: { id: string }) => (
          <QRCodeSVG
            key={id}
            value={new URL(
              `/residents/${id}`,
              process.env.NEXT_PUBLIC_DOMAIN
            ).toString()}
            size={500}
            className="w-[80vw] qrSvg"
          />
        ))}
      </section>
    </main>
  );
};
export default PrintQRs;
