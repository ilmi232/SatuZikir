'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DataService } from '@/lib/dataService';
import { LAST_CAMPAIGN_KEY } from '@/app/campaign/[slug]/CampaignRoom';

// Tab "Tasbih": buka campaign terakhir yang dikunjungi, atau campaign aktif terbaru.
export default function TasbihShortcutPage() {
  const router = useRouter();
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let last: string | null = null;
    try {
      last = localStorage.getItem(LAST_CAMPAIGN_KEY);
    } catch {
      // ignore
    }

    const openLatestActive = () =>
      DataService.getCampaigns()
        .then((list) => {
          const target = list.find((c) => c.status === 'active') ?? list[0];
          if (target) router.replace(`/campaign/${target.slug}`);
          else setEmpty(true);
        })
        .catch(() => setEmpty(true));

    if (!last) {
      openLatestActive();
      return;
    }
    // Pastikan campaign terakhir masih ada (bisa saja sudah dihapus/didraft)
    DataService.getCampaignBySlug(last)
      .then((c) => (c ? router.replace(`/campaign/${c.slug}`) : openLatestActive()))
      .catch(() => openLatestActive());
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
      {empty ? (
        <>
          <p className="text-xs text-[#404944] mb-4">Belum ada majelis zikir yang aktif.</p>
          <Link href="/" className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl">
            Kembali ke Katalog
          </Link>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full border-4 border-[#eaedff] border-t-[#003527] animate-spin mb-3" />
          <p className="text-xs text-[#404944]">Membuka ruang zikir...</p>
        </>
      )}
    </div>
  );
}
