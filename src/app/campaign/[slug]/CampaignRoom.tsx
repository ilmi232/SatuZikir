'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import TasbihScreen from '@/components/TasbihScreen';
import Link from 'next/link';

export default function CampaignRoom({ slug }: { slug: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    DataService.getCampaignBySlug(slug)
      .then(setCampaign)
      .catch((err) => setLoadError((err as Error).message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#eaedff] border-t-[#003527] animate-spin mb-3" />
        <p className="text-xs text-[#404944]">Menyiapkan ruang zikir jamaah...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <h2 className="font-headline text-xl font-bold text-[#003527] mb-1">
          {loadError ? 'Gagal Memuat Amalan' : 'Amalan Tidak Ditemukan'}
        </h2>
        <p className="text-xs text-[#404944] mb-4">
          {loadError
            ? 'Koneksi ke server sedang bermasalah. Silakan muat ulang halaman.'
            : 'Amalan yang Anda tuju mungkin sudah selesai atau tautan kurang tepat.'}
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return <TasbihScreen campaign={campaign} />;
}
