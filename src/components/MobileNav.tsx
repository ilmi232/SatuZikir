'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const isKatalog = pathname === '/';
  const isTasbih = pathname.startsWith('/campaign');
  const isRiwayat = pathname === '/riwayat';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] rounded-[32px] z-40 glass-pill dark-mode-transition">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Tab 1: Katalog */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isKatalog
              ? 'text-[#003527] dark:text-[#4edea3] font-bold'
              : 'text-[#404944] dark:text-[#9cb8a2] hover:text-[#131b2e] dark:hover:text-[#f0fdf4]'
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
              ? 'text-[#003527] dark:text-[#4edea3] font-bold'
              : 'text-[#404944] dark:text-[#9cb8a2] hover:text-[#131b2e] dark:hover:text-[#f0fdf4]'
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

        {/* Tab 3: Riwayat */}
        <Link
          href="/riwayat"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isRiwayat
              ? 'text-[#003527] dark:text-[#4edea3] font-bold'
              : 'text-[#404944] dark:text-[#9cb8a2] hover:text-[#131b2e] dark:hover:text-[#f0fdf4]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ fontVariationSettings: isRiwayat ? "'FILL' 1" : "'FILL' 0" }}
          >
            military_tech
          </span>
          <span className="text-[11px] font-medium">Riwayat</span>
        </Link>

        {/* Tab 4: Admin */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            isAdmin
              ? 'text-[#003527] dark:text-[#4edea3] font-bold'
              : 'text-[#404944] dark:text-[#9cb8a2] hover:text-[#131b2e] dark:hover:text-[#f0fdf4]'
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
