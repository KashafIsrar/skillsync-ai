import type { Metadata } from "next";
import OfflineBanner from "@/components/OfflineBanner";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "SkillSync AI | Resume Skill Coverage", template: "%s | SkillSync AI" },
  description: "Compare a resume with a job description, review evidence-backed skill coverage, and get careful suggestions for stronger resume bullets.",
  applicationName: "SkillSync AI",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};
export const viewport = { themeColor: "#16131F", colorScheme: "light dark" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><OfflineBanner />{children}</body></html>;
}
