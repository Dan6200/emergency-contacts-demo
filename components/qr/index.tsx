"use client";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { QrReader } from "react-qr-reader";
import { CameraOff } from "lucide-react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";

export default function QRFetchResidents() {
  const [camOn, setCamOn] = useState(false),
    [isQR, setIsQR] = useState(false),
    [fetchResidentErr, setFetchResidentErr] = useState<string | null>(null);
  const router = useRouter();
  const Id = "qr-video";
  // Set Fallback elements when camera does not show
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => setCamOn(stream.active));
  }, []);
  // Error Message to UI
  useEffect(() => {
    let debouncedFunc: any;
    if (fetchResidentErr) {
      toast({
        title: fetchResidentErr,
      });
      debouncedFunc = debounce(() => {
        setIsQR(false);
        setFetchResidentErr(null);
      }, 1000);
      debouncedFunc();
    }
    return () => debouncedFunc?.cancel();
  }, [isQR, fetchResidentErr]);
  return (
    <main className="w-full px-4 md:w-1/2 mx-auto my-4">
      <h1 className="text-3xl font-semibold">Scan Qr code</h1>
      {camOn ? (
        <QrReader
          constraints={{ facingMode: "environment" }}
          videoId={Id}
          onResult={(result, error) => {
            if (result) {
              setIsQR(true);
              const ID = result.getText();
              try {
                const url = `/resident/${ID}`;
                fetch(url, { method: "HEAD" }).then((res) => {
                  if (res.ok) router.push(url.toString());
                  if (res.status === 404)
                    setFetchResidentErr("Resident Does Not Exist");
                });
              } catch (e) {
                setFetchResidentErr("Failed to Retrieve Resident Info");
                console.error(e);
              }
            }
            if (error) {
            }
          }}
          className={
            (isQR ? "bg-green-700 " : "bg-red-600 ") +
            "transition-colors border-2 rounded-lg p-4 sm:p-6 md:p-8 flex items-center bg-green-700 my-4 bg-black-800 mx-auto"
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
      ) : (
        <div className="flex flex-col gap-5 border-4 my-4 p-4 sm:p-6 border-primary/80 md:p-8 h-[40vh] w-full rounded-md">
          <CameraOff className="w-28 h-28 mx-auto" />
          <p className="text-xl capitalize">
            Camera is off. Please turn on camera and refresh to scan QR code
          </p>
        </div>
      )}
    </main>
  );
}
