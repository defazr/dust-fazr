import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TickerServer } from "@/components/TickerServer";
import { StickyHeader } from "@/components/StickyHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollReset } from "@/components/ScrollReset";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DUST.FAZR — Real-Time Global Air Quality Index & PM2.5 Data",
    template: "%s | DUST.FAZR",
  },
  description: "Check real-time air quality for 130+ cities worldwide. Live AQI, PM2.5, PM10 pollution data with health recommendations. Updated hourly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.com"),
  openGraph: {
    siteName: "DUST.FAZR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7976139023602789"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white">
        <ScrollReset />
        <TickerServer />
        <StickyHeader />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
