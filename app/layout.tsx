import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header";
import Providers from "./providers";
import { signOut } from "@/app/admin/sign-in/action";
import { getAllResidentsDataLite } from "./admin/residents/data";

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
  const residents = await getAllResidentsDataLite().catch((e) => {
    throw new Error("Failed to Retrieve Residents Data -- Tag:14.\n\t" + e);
  });
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header {...{ signOut, residents }} />
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
