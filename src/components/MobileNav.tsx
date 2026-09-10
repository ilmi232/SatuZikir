'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const isKatalog = pathname === '/';
  const isTasbih = pathname.startsWith('/campaign');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] z-50 pb-safe bg-[#faf8ff]/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-[#eaedff]">
      <div className="flex justify-around items-center h-16 px-1">
        {/* Tab 1: Katalog */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isKatalog
              ? 'text-[#003527] font-bold'
              : 'text-[#404944] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isKatalog ? "'FILL' 1" : "'FILL' 0" }}
          >
            format_list_bulleted
          </span>
          <span className="text-[11px] font-medium">Katalog</span>
        </Link>

        {/* Tab 2: Tasbih Live */}
        <Link
          href="/campaign/shalawat-nariyah-4444"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isTasbih
              ? 'text-[#003527] font-bold'
              : 'text-[#404944] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isTasbih ? "'FILL' 1" : "'FILL' 0" }}
          >
            radio_button_checked
          </span>
          <span className="text-[11px] font-medium">Tasbih</span>
        </Link>

        {/* Tab 3: Hajat & Doa */}
        <Link
          href="/campaign/shalawat-nariyah-4444#prayers"
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 text-[#404944] hover:text-[#131b2e] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">favorite</span>
          <span className="text-[11px] font-medium">Hajat & Doa</span>
        </Link>

        {/* Tab 4: Admin */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isAdmin
              ? 'text-[#003527] font-bold'
              : 'text-[#404944] hover:text-[#131b2e]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isAdmin ? "'FILL' 1" : "'FILL' 0" }}
          >
            tune
          </span>
          <span className="text-[11px] font-medium">Admin</span>
        </Link>
      </div>
    </nav>
  );
}
