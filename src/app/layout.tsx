// import { Inter } from "next/font/google";
import "./fonts.css";
import "./globals.css";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { DraftModeNotification } from "@/ui/components/DraftModeNotification";

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Storefront",
	description: "e-commerce",
	metadataBase: process.env.NEXT_PUBLIC_STOREFRONT_URL
		? new URL(process.env.NEXT_PUBLIC_STOREFRONT_URL)
		: undefined,
};

export default function RootLayout(props: { children: ReactNode }) {
	const { children } = props;

	return (
		<html lang="en" className="min-h-dvh">
			<body className={`min-h-dvh`}>
				{children}
				<DraftModeNotification />
			</body>
		</html>
	);
}
