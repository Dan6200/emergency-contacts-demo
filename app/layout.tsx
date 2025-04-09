import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {Toaster} from "@/components/ui/toaster";
import {Analytics} from "@vercel/analytics/react";
import "./globals.css";
import Header from "@/components/header/index";
import Providers from "./providers";
import {getAllRooms} from "./admin/residents/data-actions";

const inter = Inter({subsets: ["latin"], display: "swap"});

export const metadata: Metadata = {
	title: "Emergency Contacts Web Portal",
	description: "Demo for a web portal I built for a Facility",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const rooms =
		(await getAllRooms().catch((e) => {
			console.log("Failed to Retrieve Rooms.\n\t" + e);
		})) ?? null;
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>
					<Header
						{...{
							rooms,
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
