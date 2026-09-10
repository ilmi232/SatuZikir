'use client';

import React, { useState } from 'react';

interface ShareSyiarButtonProps {
  campaignName: string;
  campaignSlug: string;
  personalCount: number;
  totalCount: number;
  targetCount: number;
  variant?: 'minimal' | 'full';
  label?: string;
}

export default function ShareSyiarButton({
  campaignName,
  campaignSlug,
  personalCount,
  totalCount,
  targetCount,
  variant = 'full',
  label = 'Ajak Berzikir',
}: ShareSyiarButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const remaining = Math.max(0, targetCount - totalCount);
  const pct = Math.round((totalCount / targetCount) * 100);
  const shareText = `Alhamdulillah, baru saja menyumbang ${personalCount.toLocaleString('id-ID')}x ${campaignName} bersama jamaah SatuZikir. Sudah ${pct}% tercapai (kurang ${remaining.toLocaleString('id-ID')} butir lagi menuju khatam). Mari bergabung: https://satuzikir.id`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SatuZikir',
          text: shareText,
        });
        showSuccessToast();
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
    showSuccessToast();
  };

  const showSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <>
      {variant === 'full' ? (
        <button
          onClick={handleShare}
          type="button"
          className="w-full h-12 rounded-xl bg-[#064e3b] hover:bg-[#003527] text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">share</span>
          <span>{label}</span>
        </button>
      ) : (
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-[#eaedff] text-[#003527] flex items-center justify-center cursor-pointer hover:bg-[#e2e7ff] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">ios_share</span>
        </button>
      )}

      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#283044] text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm whitespace-nowrap">
          Jazakallah khairan! Syiar kebaikan terkirim 🤲
        </div>
      )}
    </>
  );
}
