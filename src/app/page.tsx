'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import CampaignCard from '@/components/CampaignCard';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [liveTotal, setLiveTotal] = useState<number>(0);

  useEffect(() => {
    DataService.getCampaigns().then((data) => {
      setCampaigns(data);
      const sum = data.reduce((acc, c) => acc + Number(c.current_count), 0);
      setLiveTotal(sum);
    });
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedCategory === 'semua') return true;
    if (selectedCategory === 'syifa') return c.category === 'syifa' || !c.category;
    if (selectedCategory === 'ramadan') return c.category === 'ramadan';
    if (selectedCategory === 'tolak-bala') return c.category === 'tolak-bala';
    return true;
  });


  return (
    <div className="flex flex-col w-full px-4 gap-4">
      {/* Hero Banner: Spiritual Living Sanctuary */}
      <section className="relative w-full rounded-3xl overflow-hidden glass-panel text-[#131b2e] dark:text-white p-6 flex flex-col gap-4">
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-[#31c98f]">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-[#b0f0d6] uppercase tracking-wider">
              Kekuatan Jamaah Nusantara
            </span>
          </div>

          <div className="flex flex-col">
            <h2 className="font-headline text-[26px] font-bold leading-tight text-[#003527] dark:text-white drop-shadow-sm">
              Bergabung dalam Jutaan Butir Zikir Umat Hari Ini
            </h2>
            <p className="text-[13px] text-[#404944] dark:text-[#95d3ba] mt-2 leading-relaxed font-medium">
              Satu niat, beribu ketukan tasbih. Satukan hati merajut doa bersama saudara seiman di seluruh penjuru negeri.
            </p>
          </div>

          {/* Live Counters Micro-Grid */}
          <div className="flex flex-col mt-2">
              <div className="flex flex-col bg-white/40 dark:bg-[#003527]/40 rounded-2xl p-3 backdrop-blur-md border border-white/40 dark:border-[#064e3b]/50 shadow-inner">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-emerald-800 dark:text-[#95d3ba]">Total Zikir Jamaah</span>
                </div>
                <span className="font-headline text-[22px] text-[#003527] dark:text-white font-bold mt-0.5">
                  {liveTotal.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-[#404944] dark:text-[#95d3ba]/80">butir zikir terbaca untuk semua majelis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Kategori Tasbih */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <span className="font-headline text-lg text-[#003527] font-bold">Ruang Munajat</span>
          <span className="text-xs text-[#404944] font-medium">
            {filteredCampaigns.length} Kampanye Berlangsung
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'syifa', label: 'Hajat & Syifa' },
            { id: 'ramadan', label: 'Ramadan & Harian' },
            { id: 'tolak-bala', label: 'Tolak Bala & Duka' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#003527] text-white shadow-sm'
                    : 'bg-[#eaedff] text-[#404944] hover:bg-[#e2e7ff]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Campaign Cards List */}
      <div className="flex flex-col gap-3.5 w-full">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>


    </div>
  );
}
