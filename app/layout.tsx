import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "./components/InstallPrompt"; // Make sure path is correct

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tsviyo RideShare",
  description:
    "Tsviyo RideShare is a ride-hailing application that connects riders with drivers seamlessly.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png" },
      { url: "/icons/icon-512x512.png", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
