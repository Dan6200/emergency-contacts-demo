import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "LinkID",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <body> */}
        <Header initialUser={null} />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
