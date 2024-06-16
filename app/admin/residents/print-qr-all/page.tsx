import { getAllResidentsDataLite } from "@/app/residents/functions";
import PrintQrs from "@/components/residents/print-qrs";

const PrintAllResidentsQRCode = async () => {
  const AllResidents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:24.\n\t" + e);
  });
  <PrintQrs {...{ AllResidents }} />;
};

export default PrintAllResidentsQRCode;
