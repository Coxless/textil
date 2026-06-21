import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const display = Space_Grotesk({
	subsets: ["latin"],
	variable: "--f-display",
	weight: ["400", "500", "600", "700"],
});

export const body = Inter({
	subsets: ["latin"],
	variable: "--f-body",
	weight: ["400", "500", "600"],
});

export const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--f-mono",
	weight: ["400", "500", "700"],
});
