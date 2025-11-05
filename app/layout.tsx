import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://example.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Minimal Blog",
    template: "%s | Minimal Blog",
  },
  description: "Minimal Blog is a dark, editorial-style landing page for Markdown content built with Next.js 16.",
  keywords: [
    "Minimal Blog",
    "Next.js 16",
    "Markdown blog",
    "Static site",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Minimal Blog",
    description: "Discover long-form Markdown posts rendered with a modern, high-contrast reading experience.",
    url: siteUrl,
    siteName: "Minimal Blog",
    images: [
      {
        url: `${siteUrl}/screenshots/home.png`,
        width: 1600,
        height: 900,
        alt: "Minimal Blog homepage",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minimal Blog",
    description: "Discover long-form Markdown posts rendered with a modern, high-contrast reading experience.",
    images: [`${siteUrl}/screenshots/home.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
