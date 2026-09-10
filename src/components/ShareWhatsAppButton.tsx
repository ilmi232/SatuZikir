'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { Campaign } from '@/types';

interface ShareWhatsAppButtonProps {
  campaign: Campaign;
  className?: string;
}

export default function ShareWhatsAppButton({ campaign, className = '' }: ShareWhatsAppButtonProps) {
  const [copied, setCopied] = useState(false);

  const remaining = Math.max(0, campaign.target_count - campaign.current_count);
  const percent = Math.min(100, Math.round((campaign.current_count / campaign.target_count) * 100));

  const handleShare = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    let text = `*Bismillah, Mari Berzikir Bersama di SatuZikir*\n\n`;
    text += `*${campaign.title}*\n`;
    if (campaign.status === 'completed') {
      text += `Alhamdulillah! Target *${campaign.target_count.toLocaleString()}x* telah tercapai bersama jamaah.\n\n`;
    } else {
      text += `Terkumpul: *${campaign.current_count.toLocaleString()}* dari target *${campaign.target_count.toLocaleString()}* (${percent}%)\n`;
      text += `Tersisa: *${remaining.toLocaleString()}x* lagi untuk disempurnakan.\n\n`;
    }
    text += `Bebas klik tanpa login, sentuhan langsung terakumulasi real-time bersama jamaah lain:\n`;
    text += `${pageUrl}\n\n`;
    text += `_Yuk ikut berzikir walau 7x atau 33x, semoga menjadi wasilah terkabulnya hajat kita bersama. Aamiin._`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleShare}
        type="button"
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
      >
        <Share2 className="w-4 h-4 text-emerald-100" />
        <span>Ajak Jamaah via WhatsApp</span>
      </button>

      <button
        onClick={handleCopyLink}
        type="button"
        title="Salin Tautan"
        className="flex items-center justify-center w-11 h-11 bg-emerald-900/60 hover:bg-emerald-800/80 active:scale-95 text-emerald-200 border border-emerald-700/50 rounded-xl transition-all cursor-pointer"
      >
        {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4 rotate-90" />}
      </button>
    </div>
  );
}
