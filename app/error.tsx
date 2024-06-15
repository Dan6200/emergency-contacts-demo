"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({ subsets: ["latin"], display: "swap" });

export default function Error({
  error,
}: {
  error: Error & { digest: string };
}) {
  const [show, setShow] = useState(false);
  return (
    <main className="flex gap-10 flex-col container sm:w-4/5 max-h-screen py-32">
      <h1 className="text-3xl font-semibold mx-auto text-center">
        Sorry, We've Run Into An Unexpected Error
      </h1>
      <p className="text-center">Please Try Again Later Or Contact An Admin</p>
      <div className="flex w-full border-b" onMouseDown={() => setShow(!show)}>
        <h4 className="font-semibold uppercase">developer information</h4>
        {show ? <ChevronUp /> : <ChevronDown />}
      </div>
      {show && (
        <pre className="p-2 my-2 bg-slate-950 rounded-md overflow-x-scroll">
          <code className={`text-destructive ${robotoMono.className}`}>
            {JSON.stringify(error)
              .replaceAll(/\\n/g, "\n")
              .replaceAll(/\\t/g, "\t")}
          </code>
        </pre>
      )}
    </main>
  );
}
