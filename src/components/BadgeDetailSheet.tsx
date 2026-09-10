'use client';

import React from 'react';
import type { Badge } from '@/lib/localStats';

interface BadgeDetailSheetProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeDetailSheet({ badge, onClose }: BadgeDetailSheetProps) {
  if (!badge) return null;

  const handleShare = () => {
    const text = `Alhamdulillah, meraih lencana '${badge.name}' bersama SatuZikir. Mari istiqomah berzikir: https://satuzikir.id`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-[480px] mx-auto bg-white rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="w-full flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="px-6 pb-6 pt-2 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.isUnlocked ? 'bg-[#ffdcc3] text-[#904d00]' : 'bg-[#eaedff] text-[#404944]'}`}>
              {badge.isUnlocked ? 'Lencana Terbuka' : 'Lencana Berjalan'}
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
            </button>
          </div>
          
          <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full drop-shadow-lg ${badge.isUnlocked ? (badge.colorClass.includes('003527') ? 'text-[#003527]' : 'text-[#904d00]') : 'text-gray-300'}`}>
              <polygon fill="currentColor" points="50,5 61,28 85,28 73,48 85,68 61,68 50,91 39,68 15,68 27,48 15,28 39,28" />
              <polygon fill="currentColor" points="50,15 67,23 75,40 67,57 50,65 33,57 25,40 33,23" opacity="0.3" transform="rotate(45 50 50)" />
            </svg>
            <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center shadow-inner">
               <span className={`material-symbols-outlined text-4xl ${badge.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                 {badge.icon}
               </span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold font-[family-name:var(--font-eb-garamond)] text-[#131b2e] mb-2 text-center">
            {badge.name}
          </h2>
          
          {badge.progressText && !badge.isUnlocked && (
            <div className="w-full mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="font-semibold text-[#003527]">{badge.progressText}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#003527] h-2 rounded-full transition-all" style={{ width: `${badge.progress}%` }} />
              </div>
            </div>
          )}
          
          <div className="bg-[#faf8ff] border border-[#eaedff] rounded-2xl p-4 w-full mb-6">
            <p className="text-[#404944] text-sm text-center mb-3">
              {badge.description}
            </p>
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs text-gray-500 italic text-center leading-relaxed">
                "Amalan yang paling dicintai Allah adalah yang berkesinambungan (istiqomah) walaupun sedikit."
              </p>
              <p className="text-[10px] text-gray-400 text-center mt-1">— HR. Bukhari & Muslim</p>
            </div>
          </div>
          
          {badge.isUnlocked ? (
            <button onClick={handleShare} className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-full font-semibold flex items-center justify-center gap-2 mb-3 shadow-md shadow-[#25D366]/30 transition-all">
              <span className="material-symbols-outlined text-xl">share</span>
              Bagikan ke WhatsApp
            </button>
          ) : (
             <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-full font-semibold flex items-center justify-center gap-2 mb-3 cursor-not-allowed">
               Teruskan Zikir untuk Membuka
             </button>
          )}
          
          <button onClick={onClose} className="w-full py-3 bg-transparent text-[#404944] font-semibold hover:bg-gray-50 rounded-full transition-colors">
            Tutup & Lanjut Berzikir
          </button>
        </div>
      </div>
    </>
  );
}
