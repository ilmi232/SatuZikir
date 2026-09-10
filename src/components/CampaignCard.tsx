'use client';

import Link from 'next/link';
import { Campaign } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.min(
    100,
    Math.round((campaign.current_count / campaign.target_count) * 100)
  );
  const isCompleted =
    campaign.status === 'completed' || campaign.current_count >= campaign.target_count;

  const getCategoryMeta = () => {
    switch (campaign.category) {
      case 'ramadan':
        return { label: 'Ramadan & Harian', icon: 'bedtime', bg: 'bg-[#b0f0d6]', text: 'text-[#0b513d]' };
      case 'tolak-bala':
        return { label: 'Tolak Bala & Duka', icon: 'shield', bg: 'bg-[#ffdcc3]', text: 'text-[#2f1500]' };
      case 'syifa':
      default:
        return { label: 'Hajat & Syifa', icon: 'local_hospital', bg: 'bg-[#ffdcc3]', text: 'text-[#2f1500]' };
    }
  };

  const catMeta = getCategoryMeta();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pageUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/campaign/${campaign.slug}`
      : '';
    const text = `*Bismillah, Mari Berzikir Bersama di SatuZikir*\n\n*${campaign.title}*\nTerkumpul: *${campaign.current_count.toLocaleString()}* dari target *${campaign.target_count.toLocaleString()}* (${percentage}%)\n\nIkut berzikir live tanpa perlu login:\n${pageUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <article className="campaign-card flex flex-col bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,53,39,0.05)] border border-[#eaedff] overflow-hidden transition-all duration-300 p-4 gap-3">
      {/* Badges Header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2.5 py-1 rounded-full ${catMeta.bg} ${catMeta.text} text-[11px] font-bold flex items-center gap-1`}
        >
          <span className="material-symbols-outlined text-[13px]">{catMeta.icon}</span>
          {catMeta.label}
        </span>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#eaedff] text-[#003527] text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-pulse" />
          <span>Live: {Math.floor((campaign.current_count % 300) + 40)} jamaah</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col gap-1">
        <h3 className="font-headline text-lg text-[#003527] font-bold leading-tight line-clamp-2">
          {campaign.title}
        </h3>
        <p className="text-xs text-[#404944] line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>
      </div>

      {/* Arab Vignette Panel */}
      <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col items-center justify-center text-center">
        <p className="font-arabic text-xl text-[#003527] leading-loose tracking-wide select-text line-clamp-1">
          {campaign.arabic_text}
        </p>
        <span className="text-[11px] text-[#404944] italic mt-0.5 line-clamp-1">
          {campaign.latin_text ? `“${campaign.latin_text}”` : campaign.translation_text}
        </span>
      </div>

      {/* Glowing Progress Bar System */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-lg text-[#003527] font-bold">
              {campaign.current_count.toLocaleString()}
            </span>
            <span className="text-xs text-[#404944]">
              / {campaign.target_count.toLocaleString()} butir
            </span>
          </div>
          <span className="text-xs font-bold text-[#904d00]">
            {isCompleted ? 'Khatam Sempurna' : `${percentage}% Tercapai`}
          </span>
        </div>

        {/* Illuminated Progress Track */}
        <div className="w-full h-2.5 bg-[#e2e7ff] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#003527] via-[#31c98f] to-[#fe932c] transition-all duration-700 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Action Button & Share */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/campaign/${campaign.slug}`}
          className="flex-1 min-h-[46px] py-2 px-4 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">radio_button_checked</span>
          <span>{isCompleted ? 'Lihat Amalan Khatam' : 'Ikut Berzikir Sekarang'}</span>
        </Link>

        <button
          onClick={handleShare}
          aria-label="Bagikan Amalan"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#eaedff] text-[#404944] hover:text-[#003527] transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
    </article>
  );
}
