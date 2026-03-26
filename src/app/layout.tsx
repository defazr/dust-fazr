import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TickerServer } from "@/components/TickerServer";
import { StickyHeader } from "@/components/StickyHeader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollReset } from "@/components/ScrollReset";
import { VignetteGuard } from "@/components/VignetteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "DUST.FAZR — Real-Time Global Air Quality Index & PM2.5 Data",
    template: "%s | DUST.FAZR",
  },
  description: "Check real-time air quality for 130+ cities worldwide. Live AQI, PM2.5, PM10 pollution data with health recommendations. Updated hourly.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://dust.fazr.co.kr"),
  openGraph: {
    siteName: "DUST.FAZR",
    type: "website",
    url: "https://dust.fazr.co.kr",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "DUST.FAZR — Air Quality Today",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-default.jpg"],
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7976139023602789"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-black text-white">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3W9P03K820"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3W9P03K820');
          `}
        </Script>
        <ScrollReset />
        <VignetteGuard />
        <TickerServer />
        <StickyHeader />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
