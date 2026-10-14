import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = { title: "SkillSync AI — Resume Tailor & Gap Analyzer", description: "Semantic resume-to-job fit scoring, skill gaps and STAR bullet rewrites. Runs entirely in your browser." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${playfair.variable} ${inter.variable}`}><body>{children}</body></html>;
}
