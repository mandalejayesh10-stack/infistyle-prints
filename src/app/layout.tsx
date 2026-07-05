import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "Infistyle India | Premium Custom Online Printing",
  description: "Online Printing E-Commerce Platform - Design and order custom business cards, letterheads, apparel, mugs, pens and more.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-dark-charcoal font-sans">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

