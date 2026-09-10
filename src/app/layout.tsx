import type { Metadata, Viewport } from 'next';
import './globals.css';
import MobileHeader from '@/components/MobileHeader';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'SatuZikir - Majelis Zikir Daring Real-Time',
  description: 'Bergabung dalam jutaan butir zikir umat hari ini. Satu niat, beribu ketukan tasbih bersama jamaah se-Nusantara.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#faf8ff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full bg-[#eaedff]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex justify-center bg-[#eaedff] text-[#131b2e] antialiased">
        {/* Mobile Viewport Container (Constrained strictly to 480px) */}
        <div className="w-full max-w-[480px] min-h-screen relative flex flex-col bg-[#faf8ff] shadow-[0_2px_24px_rgba(0,53,39,0.08)]">
          <MobileHeader />
          <main className="flex-1 flex flex-col pt-16 pb-20 w-full bg-[#faf8ff]">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
