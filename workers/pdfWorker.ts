import jsPDF from "jspdf";
/*
self.onmessage = async function (
  e: MessageEvent<{
    qrSvgs: Element[];
    canvasWidth: number;
    canvasHeight: number;
  }>
) {
  const { qrSvgs, canvasWidth, canvasHeight } = e.data;
  const pdf = new jsPDF();
  Promise.all(
    qrSvgs.map(async (svg, idx) => {
      const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");
      const svgData = new XMLSerializer().serializeToString(svg);
      const encodedSvgData = encodeURIComponent(svgData);
      const dataUrl = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
      const image = new Image();
      let pngDataUrl;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        if (!ctx) throw new Error("Failed to get context");
        ctx.drawImage(image, 0, 0);
        pngDataUrl = canvas.toDataURL("image/png");
      };
      image.onerror = (e) => {
        console.error(e);
      };
      image.src = dataUrl;
      if (pngDataUrl) {
        pdf.addImage(pngDataUrl as string, 30, 50, 150, 150);
        if (idx < qrSvgs.length - 1) pdf.addPage();
      }
    })
  ).then((_) => pdf.save("Residents Qr Codes.pdf"));
};
*/

self.onmessage = async function (
  e: MessageEvent<{
    qrSvgData: string[]; // Pass SVG data as strings
    canvasWidth: number;
    canvasHeight: number;
  }>
) {
  const { qrSvgData, canvasWidth, canvasHeight } = e.data;
  const pdf = new jsPDF();

  const loadAndDrawImage = async (
    dataUrl: string,
    ctx: OffscreenCanvasRenderingContext2D
  ) => {
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error("Failed to fetch url blob");
    const blob = await response.blob();
    const image = new Image();
    return createImageBitmap(blob)
      .catch((e) => console.error("Failed to create image: " + e))
      .then((imageBitmap) => {
        ctx.drawImage(imageBitmap!, 0, 0);
        return ctx.canvas.convertToBlob();
      })
      .catch((e) => console.error("Failed to draw image: " + e));
  };

  Promise.all(
    qrSvgData.map(async (svgData, idx) => {
      const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get context");

      const encodedSvgData = encodeURIComponent(svgData);
      const dataUrl = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
      const image = new Image();
      let blob;
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        blob = ctx.canvas.convertToBlob();
      };
      image.onerror = (e) => {
        console.error(e);
      };
      image.src = dataUrl;

      // return loadAndDrawImage(dataUrl, ctx).then((blob) => {
      if (!blob) throw new Error("Failed to receive blob");
      console.log("blob", blob);
      const pngDataUrl = URL.createObjectURL(blob);
      pdf.addImage(pngDataUrl, "PNG", 30, 50, 150, 150);
      URL.revokeObjectURL(pngDataUrl); // Clean up the object URL

      if (idx < qrSvgData.length - 1) pdf.addPage();
      console.log("pdf blob", pdf.output("blob"));
    })
  )
    .catch((e) => console.error("Failed to load image: " + e))
    .then(() => pdf.output("blob"))
    .catch((e) => console.error("Failed to output blob: " + e))
    .then((pdfBlob) => {
      self.postMessage({ pdfBlob });
    })
    .catch((e) => console.error("Failed to postMessage to main thread: " + e));
};
