import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header";
import Providers from "./providers";
import { signOut } from "@/app/admin/sign-in/action";
import { getAllRooms } from "./admin/residents/data-actions";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "LinkID",
  description: "System To Manage Patient Information",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rooms = await getAllRooms().catch((e) => {
    throw new Error("Failed to Retrieve Rooms -- Tag:14.\n\t" + e);
  });
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header {...{ signOut, rooms }} />
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
