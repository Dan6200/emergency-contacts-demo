"use client";
import { redirect } from "next/navigation";
import { useLayoutEffect } from "react";

export default function NotFound() {
  useLayoutEffect(() => {
    let t: any;
    t = setTimeout(() => redirect("/"), 1000);
    return () => t;
  }, []);
  return (
    <main className="bg-background font-semibold w-4/5 text-center mx-auto py-32">
      <h1 className="text-4xl mb-4">LinkID</h1>
      <p className="text-3xl">This page does not exist</p>
    </main>
  );
}
