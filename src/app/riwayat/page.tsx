'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserStats, calculateBadges, getStreakText, UserStats, Badge } from '@/lib/localStats';
import BadgeDetailSheet from '@/components/BadgeDetailSheet';

export default function RiwayatPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [filter, setFilter] = useState<'semua' | 'minggu' | 'bulan'>('semua');
  
  useEffect(() => {
    const data = getUserStats();
    setStats(data);
    setBadges(calculateBadges(data));
  }, []);

  if (!stats) {
    return <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]"><div className="animate-pulse w-10 h-10 bg-gray-200 rounded-full"></div></div>;
  }

  const unlockedBadgesCount = badges.filter(b => b.isUnlocked).length;
  const inProgressBadgesCount = badges.length - unlockedBadgesCount;
  
  const handleShareCard = () => {
    const text = `Alhamdulillah, tabungan zikirku mencapai ${stats.totalButir.toLocaleString('id-ID')} butir bersama SatuZikir. Mari istiqomah berzikir: https://satuzikir.id`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const daysLabel = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  const formatTimeAgo = (isoStr: string) => {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hari ini • ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diffDays === 1) return 'Kemarin';
    return `${diffDays} hari lalu`;
  };

  return (
    <div className="flex flex-col w-full px-4 gap-4 pt-2 pb-24 bg-[#faf8ff] min-h-screen font-[family-name:var(--font-geist-sans)]">
      
      {/* Section 1: Profil & Ringkasan Ruhani */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#064e3b] to-[#003527] rounded-full flex items-center justify-center text-white font-bold text-lg relative shadow-md">
              HB
              <div className="absolute -bottom-1 -right-1 bg-[#31c98f] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-[#131b2e] leading-tight">Hamba Berzikir</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 bg-[#b0f0d6] text-[#003527] text-[10px] font-semibold rounded-sm">
                  Jamaah Aktif
                </span>
                <span className="text-xs text-gray-500">• {getStreakText(stats.streakDays)}</span>
              </div>
            </div>
          </div>
          <button onClick={handleShareCard} className="w-10 h-10 rounded-full bg-white border border-[#eaedff] flex items-center justify-center text-[#404944] hover:bg-gray-50 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">ios_share</span>
          </button>
        </div>
        
        <div className="bg-[#003527] rounded-[24px] p-5 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -right-4 -top-10 opacity-10">
            <span className="material-symbols-outlined text-[160px]">all_inclusive</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-[#95d3ba]">
              <span className="material-symbols-outlined text-sm">all_inclusive</span>
              <span className="text-sm font-medium">Tabungan Butir Akhirat</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold font-[family-name:var(--font-eb-garamond)] tracking-tight">
                {stats.totalButir.toLocaleString('id-ID')}
              </span>
              <span className="text-[#95d3ba] font-medium">Butir</span>
            </div>
            <p className="text-xs text-[#95d3ba]/80 mt-1 mb-6">Tercatat dalam majelis syiar dan zikir pribadi</p>
            
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] text-[#95d3ba] uppercase tracking-wider mb-1">Harian</p>
                <p className="font-semibold text-lg">{Math.round(stats.totalButir / (stats.streakDays || 1)).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#95d3ba] uppercase tracking-wider mb-1">Majelis</p>
                <p className="font-semibold text-lg">{stats.totalMajelis}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#95d3ba] uppercase tracking-wider mb-1">Khatam</p>
                <p className="font-semibold text-lg">{stats.totalKhatam}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Kalender Istiqomah */}
      <section className="bg-white rounded-2xl p-5 border border-[#eaedff] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffdcc3] text-[#904d00] flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
            </div>
            <h3 className="font-bold text-[#131b2e]">{stats.streakDays} Hari Istiqomah</h3>
          </div>
          <span className="px-2.5 py-1 bg-[#eaedff] text-[#404944] text-[10px] font-semibold rounded-full">
            Pekan Ini
          </span>
        </div>
        
        <div className="bg-[#faf8ff] rounded-xl p-3 mb-4 border border-[#eaedff]/50">
          <p className="text-xs text-gray-500 italic text-center">
            "Amalan yang paling dicintai Allah adalah yang istiqomah meskipun sedikit."
          </p>
          <p className="text-[9px] text-gray-400 text-center mt-1">— HR. Bukhari & Muslim</p>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {stats.weeklyData.map((count, index) => {
            const hasData = count > 0;
            const today = (new Date().getDay() + 6) % 7;
            const isToday = index === today;
            
            const displayCount = count > 999 ? `${(count/1000).toFixed(1)}k` : count.toString();
            
            return (
              <div key={index} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-gray-400">{daysLabel[index]}</span>
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hasData ? 'bg-[#064e3b] text-white shadow-sm' : 'bg-[#eaedff] text-transparent'} ${isToday ? 'ring-2 ring-[#31c98f] ring-offset-1' : ''}`}>
                    {hasData && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>
                  {isToday && <div className="absolute inset-0 rounded-full border border-[#31c98f] animate-pulse"></div>}
                </div>
                {hasData && (
                  <span className="text-[9px] font-semibold text-[#003527]">{displayCount}</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Koleksi Lencana Ruhani */}
      <section>
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#904d00]">military_tech</span>
            <h3 className="font-bold text-[#131b2e] text-lg">Lencana Ruhani</h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {unlockedBadgesCount} Terbuka • {inProgressBadgesCount} Berjalan
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map(badge => (
            <div 
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl cursor-pointer transition-all ${
                badge.isUnlocked 
                  ? `${badge.colorClass} text-white shadow-md hover:shadow-lg` 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              } flex items-center gap-4 relative overflow-hidden group`}
            >
              {badge.isUnlocked && (
                <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-[100px]">{badge.icon}</span>
                </div>
              )}
              
              <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                badge.isUnlocked ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'
              }`}>
                <span className={`material-symbols-outlined text-2xl ${
                  badge.isUnlocked ? 'text-white' : 'text-gray-400'
                }`}>{badge.icon}</span>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className={`font-bold text-sm ${badge.isUnlocked ? 'text-white' : 'text-[#131b2e]'}`}>
                    {badge.name}
                  </h4>
                  {badge.isUnlocked && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-400/90 text-amber-900 rounded-sm uppercase tracking-wide">
                      Teraih
                    </span>
                  )}
                </div>
                
                {badge.isUnlocked ? (
                  <p className="text-xs text-white/80 line-clamp-1">{badge.description}</p>
                ) : (
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700">{badge.progressText}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#003527]/40 h-1.5 rounded-full" style={{ width: `${badge.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Riwayat Kontribusi */}
      <section className="bg-white rounded-2xl p-5 border border-[#eaedff] shadow-sm mt-2">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#003527]">history_edu</span>
          <h3 className="font-bold text-[#131b2e] text-lg">Riwayat Kontribusi</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
          {(['semua', 'minggu', 'bulan'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f ? 'bg-[#003527] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1).replace('Minggu', 'Minggu Ini').replace('Bulan', 'Bulan Ini')}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col gap-3">
          {stats.sessions.length > 0 ? stats.sessions.map((session, idx) => (
            <div key={idx} className="flex gap-3 py-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-[#f4f7f5] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#003527] text-lg">menu_book</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-semibold text-[#131b2e] text-sm truncate pr-2">
                    {session.campaignName}
                  </h4>
                  <span className="font-bold text-[#003527] whitespace-nowrap">
                    +{session.count.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                  <span>{formatTimeAgo(session.timestamp)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1">
                    {session.isKhatam ? (
                      <><span className="material-symbols-outlined text-[12px] text-[#31c98f]">check_circle</span> <span className="text-[#31c98f] font-medium">Khatam Sempurna</span></>
                    ) : (
                      <><span className="w-1.5 h-1.5 rounded-full bg-[#904d00]"></span> <span className="text-[#904d00]">Majelis Berjalan</span></>
                    )}
                  </div>
                </div>
                
                <Link href={`/campaign/${session.campaignSlug}`} className="inline-block">
                  <span className="text-xs font-medium text-[#003527] hover:underline bg-[#f4f7f5] px-2.5 py-1 rounded-md">
                    Ikut Lagi
                  </span>
                </Link>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-gray-300 text-4xl mb-2">inbox</span>
              <p className="text-gray-500 text-sm">Belum ada riwayat majelis zikir.</p>
              <Link href="/" className="mt-3 text-[#003527] font-semibold text-sm hover:underline">
                Mulai Berzikir Sekarang
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 5: CTA Bawah */}
      <section className="mt-4 text-center">
        <button 
          onClick={handleShareCard}
          className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-full font-semibold flex items-center justify-center gap-2 mb-3 shadow-md shadow-[#25D366]/30 transition-all"
        >
          <span className="material-symbols-outlined text-xl">share</span>
          Bagikan Kartu Istiqomah ke WhatsApp
        </button>
        <p className="text-[11px] text-gray-400 px-4 leading-relaxed">
          Syiar tanpa riya'. Niatkan semata menyemangati keluarga & sahabat untuk turut memperbanyak zikir dan selawat.
        </p>
      </section>
      
      {/* Detail Lencana Modal */}
      <BadgeDetailSheet 
        badge={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
      />
      
    </div>
  );
}
