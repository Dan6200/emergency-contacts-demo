"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({ subsets: ["latin"] });

export default function Error({
  error,
}: {
  error: Error & { digest: string };
}) {
  const [show, setShow] = useState(false);
  return (
    <main className="container w-4/5 max-h-screen p-8">
      <h1 className="mb-12 text-3xl font-semibold mx-auto text-center">
        Sorry, We've Run Into An Unexpected Error
      </h1>
      <div className="flex w-full border-b" onMouseDown={() => setShow(!show)}>
        <h4 className="font-semibold uppercase">developer information</h4>
        {show ? <ChevronUp /> : <ChevronDown />}
      </div>
      {show && (
        <div className="p-2 my-2 bg-black rounded-md">
          <p className={`text-destructive ${robotoMono.className}`}>
            {error.message}
          </p>
        </div>
      )}
    </main>
  );
}
