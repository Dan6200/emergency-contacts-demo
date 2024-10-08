import type { Metadata } from "next";
import "@/firebase/auth/state";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header/index";
import Providers from "./providers";
import { signOut } from "@/app/admin/sign-in/action";
import { getAllRooms } from "./admin/residents/data-actions";
import { auth } from "@/firebase/config";

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
  await auth.authStateReady();
  const admin = auth.currentUser;

  const rooms =
    (await getAllRooms().catch((e) => {
      console.log("Failed to Retrieve Rooms -- Tag:14.\n\t" + e);
    })) ?? null;
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header
            {...{
              signOut,
              rooms: rooms,
              initialUser: admin?.toJSON() ?? null,
            }}
          />
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
