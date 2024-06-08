import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header";
import { getAuthenticatedAppForUser } from "@/server";
import { User } from "firebase/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LinkID",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentUser } = await getAuthenticatedAppForUser();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
