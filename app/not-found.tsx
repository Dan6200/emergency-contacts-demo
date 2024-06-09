"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => router.back(), 1000);
  }, []);
  return (
    <main className="bg-background font-semibold w-4/5 text-center mx-auto py-8">
      <h1 className="text-4xl mb-4">LinkID</h1>
      <p className="text-3xl">This page does not exist</p>
    </main>
  );
}
