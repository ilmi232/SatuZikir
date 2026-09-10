import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SatuZikir - Platform Zikir Online Bersama Real-Time",
  description: "Bersama-sama melantunkan amalan zikir dan shalawat. Setiap ketukan terakumulasi secara real-time dari seluruh jamaah.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SatuZikir - Platform Zikir Online Bersama Real-Time",
    description: "Satu ketukan, jutaan pahala bersama. Mari sempurnakan amalan zikir bersama jamaah seluruh dunia.",
    url: "https://satuzikir.com",
    siteName: "SatuZikir",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#04130d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-islamic-pattern text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
