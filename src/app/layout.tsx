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
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        {/* Anti-FOUC: apply dark class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
  try {
    var t = localStorage.getItem('satuzikir_theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
` }} />
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
