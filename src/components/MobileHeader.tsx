'use client';

import Link from 'next/link';
import SatuZikirLogo from './SatuZikirLogo';

export default function MobileHeader() {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'SatuZikir - Majelis Zikir Daring Real-Time',
        text: 'Mari berzikir bersama jamaah seluruh Nusantara. Bebas tanpa login, terakumulasi detik demi detik.',
        url: window.location.origin,
      }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        'Bismillah, mari berzikir bersama jamaah di SatuZikir: ' + window.location.origin
      )}`;
      window.open(waUrl, '_blank');
    }
  };

  return (
    <header className="fixed top-0 w-full max-w-[480px] z-50 pt-safe bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Brand with Emblem Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <SatuZikirLogo className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-xl text-[#003527] font-bold tracking-tight">
                SatuZikir
              </span>
              <span className="bg-[#ffdcc3] text-[#2f1500] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Live Jamaah
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-pulse" />
              <span className="text-[11px] text-[#404944] font-medium">
                Real-Time Sync Terhubung
              </span>
            </div>
          </div>
        </Link>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            aria-label="Notifikasi & Siar"
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#404944] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
          <Link
            href="/admin"
            aria-label="Admin Portal"
            className="w-8 h-8 rounded-full bg-[#003527] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
