'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import CampaignCard from '@/components/CampaignCard';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [liveTotal, setLiveTotal] = useState<number>(148920);
  const [activeJamaah, setActiveJamaah] = useState<number>(1420);

  useEffect(() => {
    DataService.getCampaigns().then((data) => {
      setCampaigns(data);
      const sum = data.reduce((acc, c) => acc + Number(c.current_count), 0);
      if (sum > 0) setLiveTotal(sum);
    });

    // Real-time micro-pulse counter increment simulation
    const interval = setInterval(() => {
      setLiveTotal((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setActiveJamaah((prev) => Math.max(1200, prev + Math.floor(Math.random() * 5) - 2));
    }, 4000);

    return () => clearInterval(interval);
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
      <section className="relative w-full rounded-2xl overflow-hidden bg-[#064e3b] text-white shadow-md">
        {/* Subtle decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#003527] via-[#064e3b]/80 to-transparent" />
        <div className="relative z-10 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center p-1 rounded-full bg-[#004f34]/80 text-[#31c98f]">
              <span className="material-symbols-outlined text-[16px]">groups</span>
            </span>
            <span className="text-[11px] font-bold text-[#b0f0d6] uppercase tracking-wider">
              Kekuatan Jamaah Nusantara
            </span>
          </div>

          <div className="flex flex-col">
            <h2 className="font-headline text-2xl text-white font-bold leading-tight">
              Bergabung dalam Jutaan Butir Zikir Umat Hari Ini
            </h2>
            <p className="text-xs text-[#95d3ba] mt-1 leading-relaxed">
              Satu niat, beribu ketukan tasbih. Satukan hati merajut doa bersama saudara seiman di seluruh penjuru negeri.
            </p>
          </div>

          {/* Live Counters Micro-Grid */}
          <div className="grid grid-cols-2 gap-2 mt-1 pt-1">
            <div className="flex flex-col bg-[#003527]/60 rounded-xl p-2.5 backdrop-blur-sm border border-[#064e3b]/50">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-ping" />
                <span className="text-[10px] text-[#95d3ba]">Terhimpun Hari Ini</span>
              </div>
              <span className="font-headline text-xl text-white font-bold mt-0.5 font-mono">
                {liveTotal.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-[#95d3ba]/80">butir zikir terbaca</span>
            </div>

            <div className="flex flex-col bg-[#003527]/60 rounded-xl p-2.5 backdrop-blur-sm border border-[#064e3b]/50">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffdcc3] animate-pulse" />
                <span className="text-[10px] text-[#95d3ba]">Jamaah Aktif</span>
              </div>
              <span className="font-headline text-xl text-[#ffdcc3] font-bold mt-0.5 font-mono">
                {activeJamaah.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-[#95d3ba]/80">sedang berzikir</span>
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
