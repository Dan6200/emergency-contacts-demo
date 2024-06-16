//cspell:ignore jspdf qrcode
"use client";
import { Resident } from "@/types/resident";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import { useRef, useLayoutEffect } from "react";

const PrintQRs = ({ AllResidents }: { AllResidents: Resident[] }) => {
  const qrRefs = Array(AllResidents.length).fill(useRef(null));
  console.log(AllResidents[0]);

  /*
  useLayoutEffect(() => {
    handleDownload(qrRefs);
  }, []);

  const handleDownload = (qrs: SVGElement[]) => {
    const pdf = new jsPDF();
    qrs.forEach((qr, idx) => {
      pdf.addSvgAsImage(
        qr.outerHTML,
        0,
        idx * 30,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );
      if (idx < qrs.length - 1) pdf.addPage();
    });
    pdf.save("Residents Qr Codes.pdf");
  };
	 */

  return qrRefs.map((ref, idx) => (
    <QRCodeSVG
      ref={ref}
      key={idx}
      value={new URL(
        `/residents/${AllResidents[idx].id}`,
        process.env.DOMAIN
      ).toString()}
    />
  ));
};
export default PrintQRs;
