import type { Metadata, Viewport } from 'next';
import './globals.css';
import MobileHeader from '@/components/MobileHeader';
import MobileNav from '@/components/MobileNav';

export const metadata: Metadata = {
  title: 'SatuZikir - Majelis Zikir Daring Real-Time',
  description: 'Bergabung dalam jutaan butir zikir umat hari ini. Satu niat, beribu ketukan tasbih bersama jamaah se-Nusantara.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SatuZikir',
  },
  formatDetection: {
    telephone: false,
  }
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
    <html lang="id" className="h-full bg-[#eaedff] dark:bg-black" suppressHydrationWarning>
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
      <body className="min-h-full flex justify-center bg-[#fdfcff] dark:bg-[#020503] text-[#131b2e] dark:text-[#e8f5e9] antialiased" suppressHydrationWarning>
        {/* Ambient Glowing Mesh Background for Glassmorphism */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden flex justify-center bg-gradient-to-br from-[#fdfcff] to-[#eaedff] dark:from-[#020503] dark:to-[#05110a]">
          {/* Dark mode intense glowing orbs */}
          <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-emerald-500/20 dark:bg-[#31c98f]/15 blur-[80px] mix-blend-screen animate-aurora"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-amber-500/20 dark:bg-[#fe932c]/15 blur-[100px] mix-blend-screen animate-aurora-alt"></div>
          <div className="absolute top-[30%] left-[50%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-emerald-700/10 blur-[90px] mix-blend-screen animate-aurora" style={{animationDelay: '5s'}}></div>
        </div>

        {/* Mobile Viewport Container (Constrained strictly to 480px) */}
        <div className="w-full max-w-[480px] min-h-screen relative flex flex-col bg-transparent shadow-[0_2px_40px_rgba(0,53,39,0.1)] dark:shadow-none">
          <MobileHeader />
          <main className="flex-1 flex flex-col pt-16 pb-28 w-full bg-transparent">
            {children}
          </main>
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
