import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { siteUrl, siteName, siteDescription } from "@/lib/seo";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    siteName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  // Browser identity (ZW-WEB-04C). The primary icon is src/app/icon.svg, a
  // byte-for-byte copy of the locked public/brand/zenward-favicon.svg, which
  // Next emits as <link rel="icon" type="image/svg+xml">. The locked PNGs
  // below are fallbacks for browsers without SVG favicon support, plus the
  // apple-touch icon. Never point these at regenerated artwork.
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/brand/zenward-favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/zenward-favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/brand/zenward-app-icon-192.png", type: "image/png", sizes: "192x192" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full`}>
      <body className="min-h-full font-sans text-text-primary antialiased">
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  );
}
