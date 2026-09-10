'use client';

import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import CampaignCard from '@/components/CampaignCard';
import { Sparkles, Users, HeartHandshake, ShieldCheck, Flame } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    DataService.getCampaigns().then((data) => {
      setCampaigns(data);
      setLoading(false);
    });
  }, []);

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === 'active') return c.status === 'active' && c.current_count < c.target_count;
    if (filter === 'completed') return c.status === 'completed' || c.current_count >= c.target_count;
    return true;
  });

  const totalZikir = campaigns.reduce((acc, c) => acc + Number(c.current_count), 0);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 text-center">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-700/50 text-xs font-semibold text-amber-300 mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Platform Majelis Zikir Daring Pertama</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Satu Ketukan Zikir,{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              Jutaan Berkah Bersama
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Bergabunglah dalam amalan zikir dan shalawat bersama jamaah dari mana saja. Setiap ketukan di layar HP Anda langsung terakumulasi secara real-time hingga target amalan tercapai.
          </p>

          {/* Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-medium mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Total Zikir Terkumpul</span>
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {totalZikir.toLocaleString()}x
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-medium mb-0.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Amalan Aktif</span>
              </div>
              <span className="text-lg sm:text-xl font-extrabold text-white font-mono">
                {campaigns.filter((c) => c.status === 'active').length} Majelis
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-medium mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akses Bebas</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200 block mt-1">
                Tanpa Perlu Login
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Amalan Zikir Berjamaah</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pilih amalan yang ingin Anda ikuti dan sempurnakan bersama
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-emerald-950/80 rounded-xl border border-emerald-900/60 text-xs">
            <button
              onClick={() => setFilter('active')}
              type="button"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sedang Berjalan
            </button>
            <button
              onClick={() => setFilter('all')}
              type="button"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('completed')}
              type="button"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Khatam Target
            </button>
          </div>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-emerald-950/40 border border-emerald-900/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 px-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/40">
            <Users className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300 mb-1">
              Tidak ada amalan pada kategori ini
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Silakan periksa kategori lain atau buat amalan baru di dashboard admin.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
            >
              Buka Dashboard Admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
