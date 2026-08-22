import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QuickAccess } from "@/components/quick-access";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NRC Second Brain",
  description: "A private visual home for your files, notes, and projects.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<QuickAccess /></body>
    </html>
  );
}

