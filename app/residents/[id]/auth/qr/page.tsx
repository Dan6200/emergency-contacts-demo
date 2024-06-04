"use client";
import Link from "next/link";
import { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function Test({ params: { id } }: { params: { id: string } }) {
  const [data, setData] = useState(
    "Supposed to scan user id and send to server"
  );

  return (
    <main className="w-1/2 mx-auto my-16">
      <h1 className="text-cent text-3xl">Scan Qr code</h1>
      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (!!result) {
            setData(result.getText());
          }

          if (!!error) {
            console.info(error);
          }
        }}
        className="w-3/4 mx-auto"
      />
      <p>{data}</p>
      <Link href={`/residents/${id}`} className="text-blue-700 underline">
        Continue to Resident's page
      </Link>
    </main>
  );
}
