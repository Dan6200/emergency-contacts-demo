"use client";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { CameraOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QRFetchResidents() {
  const [camOn, setCamOn] = useState(false);
  const [camLoaded, setCamLoaded] = useState(false);
  const [isQR, setIsQR] = useState(false);
  {
    /* const [errorMessage, setError] = useState(""); */
  }
  const router = useRouter();
  const Id = "qr-video";
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => setCamLoaded(stream.active));
    setCamOn(camLoaded);
  }, [camLoaded]);
  /*
  useEffect(() => {
    toast({
      title: "An Error Occurred When Fetching Resident Info",
      description: errorMessage,
    });
  }, [errorMessage]);
	 */
  return (
    <main className="w-full px-4 md:w-1/2 mx-auto my-4">
      {camOn && (
        <>
          <h1 className="text-3xl font-semibold">Scan Qr code</h1>
          <QrReader
            constraints={{ facingMode: "environment" }}
            videoId={Id}
            onResult={(result, error) => {
              if (result) {
                console.log(result);
                setIsQR(true);
                const ID = result.getText();
                router.push(`/resident/${ID}`);
                /*
                const [resErr, residentsRef] = collectionWrapper(
                  db,
                  "residents"
                );
								if (resErr) setError(resErr);
								else {
									const [err, residentData] = docWrapper(residentsRef as any, ID)
									if (err) setError(err)*/
              }
              if (error) {
                console.error(error);
              }
            }}
            className={
              (isQR ? "bg-green-700 " : "bg-red-600 ") +
              "border-2 rounded-lg p-4 sm:p-6 md:p-8 flex items-center bg-green-700 my-4 bg-black-800 mx-auto"
            }
            containerStyle={{ height: "100%", width: "100%" }}
            videoContainerStyle={{ height: "100%", width: "100%" }}
            videoStyle={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              rounded: "10px",
            }}
          />
        </>
      )}
      {!camOn && (
        <div className="flex flex-col gap-5">
          <CameraOff className="w-32 h-32 mx-auto" />
          <p className="text-2xl capitalize">
            Camera is off. Please turn on camera and refresh to scan QR code
          </p>
        </div>
      )}
    </main>
  );
}
