'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import TasbihCounter from '@/components/TasbihCounter';
import PrayerWall from '@/components/PrayerWall';
import { ArrowLeft, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);

  useEffect(() => {
    if (!slug) return;
    DataService.getCampaignBySlug(slug).then((data) => {
      setCampaign(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-amber-400 animate-spin mb-4" />
        <p className="text-xs text-slate-400">Menyiapkan majelis zikir...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Amalan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 mb-6 max-w-sm">
          Amalan zikir yang Anda cari mungkin telah dipindahkan atau belum tersedia.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => router.push('/')}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-slate-300 hover:text-white border border-emerald-900/60 text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Target: {campaign.target_count.toLocaleString()}x
          </span>
        </div>
      </div>

      {/* Campaign Title & Banner */}
      <div className="text-center mb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
          {campaign.title}
        </h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          {campaign.description}
        </p>
      </div>

      {/* Arabic Lafadz Card */}
      <div className="w-full bg-gradient-to-b from-emerald-950/80 to-emerald-950/40 rounded-3xl border border-emerald-800/60 p-5 sm:p-7 shadow-xl shadow-emerald-950/50 mb-6 backdrop-blur-md">
        {/* Arabic Calligraphy Text */}
        <div className="text-center py-2 px-1">
          <p className="font-arabic text-2xl sm:text-3xl lg:text-4xl text-amber-200 leading-[2.2] tracking-wide font-normal select-text">
            {campaign.arabic_text}
          </p>
        </div>

        {/* Toggles for Latin & Translation */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-emerald-900/60 text-xs">
          <button
            onClick={() => setShowLatin(!showLatin)}
            type="button"
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              showLatin
                ? 'bg-emerald-800/70 text-amber-300 border border-emerald-600/50'
                : 'bg-emerald-950/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            Latin {showLatin ? 'Aktif' : 'Nonaktif'}
          </button>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            type="button"
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              showTranslation
                ? 'bg-emerald-800/70 text-amber-300 border border-emerald-600/50'
                : 'bg-emerald-950/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            Arti {showTranslation ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>

        {/* Transliteration */}
        {showLatin && campaign.latin_text && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/40 text-center">
            <p className="text-xs sm:text-sm text-emerald-200/90 italic leading-relaxed select-text">
              &ldquo;{campaign.latin_text}&rdquo;
            </p>
          </div>
        )}

        {/* Translation */}
        {showTranslation && campaign.translation_text && (
          <div className="mt-2.5 p-3 rounded-2xl bg-emerald-900/20 border border-emerald-800/40 text-center">
            <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider block mb-1">
              Terjemahan
            </span>
            <p className="text-xs text-slate-300 leading-relaxed select-text">
              {campaign.translation_text}
            </p>
          </div>
        )}
      </div>

      {/* Real-time Tasbih Counter */}
      <div className="mb-8">
        <TasbihCounter campaign={campaign} />
      </div>

      {/* Prayer Wall (Titip Hajat Jamaah) */}
      <div className="mb-8">
        <PrayerWall campaignId={campaign.id} />
      </div>

      {/* Poster Image / Details Collapsible */}
      {campaign.image_url && (
        <div className="w-full bg-emerald-950/40 rounded-2xl border border-emerald-900/60 overflow-hidden mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            type="button"
            className="w-full p-4 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Poster & Dalil Amalan</span>
            </div>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="p-4 pt-0">
              <div className="relative rounded-xl overflow-hidden max-h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-auto object-cover rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
