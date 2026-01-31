import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import { getSiteUrl, withSiteUrl } from "@/app/lib/site";

const siteUrl = getSiteUrl();

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
    default: "Lab",
    template: "%s | Lab",
  },
  description: "NIR is a dark, minimal-style Lab for Markdown content.",
  keywords: [
    "Lab",
    "NIR",
    "Personal Lab",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/1735490735511.ico",
    shortcut: "/1735490735511.ico",
  },
  openGraph: {
    title: "NIR / Lab",
    description: "Discover long-form Markdown posts rendered with a modern, high-contrast reading experience.",
    url: siteUrl,
    siteName: "NIR / Lab",
    images: [
      {
        url: withSiteUrl("/screenshots/home.png"),
        width: 1600,
        height: 900,
        alt: "Lab",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIR / Lab",
    description: "Discover long-form Markdown posts rendered with a modern, high-contrast reading experience.",
    images: [withSiteUrl("/screenshots/home.png")],
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
