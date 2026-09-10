'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign, Prayer } from '@/types';
import { DataService } from '@/lib/dataService';
import { playTasbihClick, playMilestoneSound, triggerHaptic } from '@/lib/audioHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { recordSession } from '@/lib/localStats';
import ShareSyiarButton from '@/components/ShareSyiarButton';

interface TasbihScreenProps {
  campaign: Campaign;
}

export default function TasbihScreen({ campaign: initialCampaign }: TasbihScreenProps) {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
  const [personalCount, setPersonalCount] = useState<number>(33);
  const [batchStep, setBatchStep] = useState<number>(0);
  const [isHapticOn, setIsHapticOn] = useState<boolean>(true);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);
  const [showExtendedDetails, setShowExtendedDetails] = useState<boolean>(true);
  const [isHajatModalOpen, setIsHajatModalOpen] = useState<boolean>(false);
  const [hajatName, setHajatName] = useState<string>('');
  const [hajatText, setHajatText] = useState<string>('');
  const [submittingHajat, setSubmittingHajat] = useState<boolean>(false);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [currentPrayerIdx, setCurrentPrayerIdx] = useState<number>(0);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [aamiinCount, setAamiinCount] = useState<number>(842);
  const [hasAamiined, setHasAamiined] = useState<boolean>(false);

  const isCompleted = campaign.status === 'completed' || campaign.current_count >= campaign.target_count;
  const percentage = Math.min(100, Math.round((campaign.current_count / campaign.target_count) * 100));

  const { requestWakeLock } = useWakeLock();

  // Pending batch queue ref
  const pendingBatchRef = useRef<number>(0);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestWakeLock();
  }, [requestWakeLock]);

  // Load personal count
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`satuzikir_user_${campaign.id}`);
      if (stored) {
        setPersonalCount(parseInt(stored, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, [campaign.id]);

  // Load prayers for live ticker
  useEffect(() => {
    DataService.getPrayers(campaign.id).then((list) => {
      if (list.length > 0) setPrayers(list);
    });

    const unsubscribePrayers = DataService.subscribeToPrayers(
      campaign.id,
      (newP) => setPrayers((prev) => [newP, ...prev]),
      () => {}
    );

    return () => {
      unsubscribePrayers();
    };
  }, [campaign.id]);

  // Rotate prayer ticker
  useEffect(() => {
    if (prayers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPrayerIdx((prev) => (prev + 1) % prayers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [prayers.length]);

  // Flush batch to server
  const flushBatch = useCallback(async () => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    const amount = pendingBatchRef.current;
    if (amount <= 0) return;

    pendingBatchRef.current = 0;
    setBatchStep(0);

    try {
      const updatedTotal = await DataService.incrementCounter(campaign.id, amount);
      const isDone = updatedTotal >= campaign.target_count;
      recordSession(campaign.id, campaign.title, campaign.slug, amount, isDone);
      if (updatedTotal > 0) {
        setCampaign((prev) => ({
          ...prev,
          current_count: Math.max(prev.current_count, updatedTotal),
          status: isDone ? 'completed' : prev.status,
        }));
      }
    } catch {
      recordSession(campaign.id, campaign.title, campaign.slug, amount, false);
    }
  }, [campaign.id, campaign.title, campaign.slug, campaign.target_count]);

  // Flush on unmount or tab close
  useEffect(() => {
    return () => {
      if (pendingBatchRef.current > 0) {
        const remaining = pendingBatchRef.current;
        DataService.incrementCounter(campaign.id, remaining);
        recordSession(campaign.id, campaign.title, campaign.slug, remaining, false);
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [campaign.id, campaign.title, campaign.slug]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = DataService.subscribeToCampaign(campaign.id, (updated) => {
      setCampaign((prev) => {
        const nextCount = updated.current_count ?? prev.current_count;
        const nextStatus = updated.status ?? prev.status;

        if (nextCount >= prev.target_count && prev.current_count < prev.target_count) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }

        return {
          ...prev,
          current_count: Math.max(prev.current_count, nextCount),
          status: nextStatus,
        };
      });
    });

    return () => unsubscribe();
  }, [campaign.id]);

  // Tap handler
  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();

    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 120);

    playTasbihClick(isAudioOn);
    triggerHaptic('tap', isHapticOn);

    const nextPersonal = personalCount + 1;
    setPersonalCount(nextPersonal);
    try {
      localStorage.setItem(`satuzikir_user_${campaign.id}`, nextPersonal.toString());
    } catch {
      // ignore
    }

    if (nextPersonal % 33 === 0) {
      playMilestoneSound(isAudioOn);
      triggerHaptic('milestone', isHapticOn);
    }

    const nextGlobal = campaign.current_count + 1;
    setCampaign((prev) => ({
      ...prev,
      current_count: nextGlobal,
      status: nextGlobal >= prev.target_count ? 'completed' : prev.status,
    }));

    if (nextGlobal >= campaign.target_count && !isCompleted) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 } });
      triggerHaptic('complete', isHapticOn);
    }

    pendingBatchRef.current += 1;
    const nextStep = (batchStep + 1) % 5;
    setBatchStep(nextStep);

    if (pendingBatchRef.current >= 5) {
      flushBatch();
    } else {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = setTimeout(() => {
        flushBatch();
      }, 1200);
    }
  };

  const handleHajatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hajatText.trim()) return;

    setSubmittingHajat(true);
    try {
      const created = await DataService.submitPrayer(campaign.id, hajatName, hajatText);
      setPrayers((prev) => [created, ...prev]);
      setHajatName('');
      setHajatText('');
      setIsHajatModalOpen(false);
    } catch {
      // ignore
    } finally {
      setSubmittingHajat(false);
    }
  };

  const handleAamiin = () => {
    if (hasAamiined) return;
    setHasAamiined(true);
    setAamiinCount((prev) => prev + 1);
    triggerHaptic('tap', isHapticOn);
  };

  const currentPrayer = prayers[currentPrayerIdx];

  const shareText = `Mari bersama-sama melantunkan ${campaign.title}. Terkumpul: ${campaign.current_count.toLocaleString()} dari target ${campaign.target_count.toLocaleString()} (${percentage}%). Gabung ruang zikir live: ${typeof window !== 'undefined' ? window.location.href : ''}`;

  return (
    <div className="flex flex-col w-full">
      {/* 1. Campaign Context & Live Activity Ribbon */}
      <div className="px-4 pt-1 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[#404944] hover:text-[#003527] transition-colors py-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-xs font-semibold">Katalog Zikir</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e2e7ff] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#31c98f] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#31c98f]" />
            </span>
            <span className="text-[11px] text-[#131b2e] font-bold">
              Live: {Math.floor((campaign.current_count % 350) + 60)} Jamaah
            </span>
          </div>
        </div>

        <div>
          <h1 className="font-headline text-xl text-[#003527] font-bold leading-tight">
            {campaign.title}
          </h1>
          <p className="text-xs text-[#404944] leading-relaxed mt-0.5">
            {campaign.description}
          </p>
        </div>
      </div>

      {/* 2. Global Target & Progress Card */}
      <div className="px-4 mb-2.5">
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[#eaedff] flex flex-col gap-2">
          <div className="flex justify-between items-baseline">
            <div className="flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-[#904d00] text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                groups
              </span>
              <span className="text-xs font-semibold text-[#131b2e]">Progres Zikir Jamaah</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-headline text-xl text-[#003527] font-bold tracking-tight">
                {campaign.current_count.toLocaleString()}
              </span>
              <span className="text-xs text-[#404944]">/ {campaign.target_count.toLocaleString()}</span>
              <span className="text-xs font-bold text-[#904d00] ml-1">({percentage}%)</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#e2e7ff] overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#064e3b] via-[#2b6954] to-[#fe932c] transition-all duration-300 rounded-full shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-0.5 text-[11px]">
            <span className="text-[#404944] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#004f34]">bolt</span>
              <span>Target Majelis Tercapai {percentage}%</span>
            </span>
            <span className="text-[#003527] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#31c98f]">sync</span>
              <span>Sinkron Real-Time</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sacred Dhikr Folio (Lafadz, Transliterasi, Terjemah) */}
      <div className="px-4 mb-2.5">
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-[#eaedff] relative overflow-hidden flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#904d00] bg-[#ffdcc3]/60 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>Fadhilah Pelapang Hajat</span>
            </span>
            <button
              onClick={() => setShowExtendedDetails(!showExtendedDetails)}
              type="button"
              className="text-[11px] text-[#404944] hover:text-[#003527] flex items-center gap-0.5 cursor-pointer font-medium"
            >
              <span>{showExtendedDetails ? 'Ringkas Bacaan' : 'Buka Lengkap'}</span>
              <span className="material-symbols-outlined text-[16px]">
                {showExtendedDetails ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {/* Arabic Calligraphy Text */}
          <div className="text-right py-1">
            <p className="font-arabic text-2xl sm:text-3xl text-[#003527] leading-[2.0] tracking-wide select-text font-normal">
              {campaign.arabic_text}
            </p>
          </div>

          {/* Expandable Transliteration & Meaning */}
          {showExtendedDetails && (
            <div className="flex flex-col gap-2 transition-all duration-300">
              {campaign.latin_text && (
                <div className="bg-[#f2f3ff] rounded-xl p-2.5">
                  <p className="text-[10px] text-[#904d00] font-bold uppercase tracking-wider mb-0.5">
                    Transliterasi
                  </p>
                  <p className="text-xs text-[#131b2e] italic leading-relaxed">
                    &ldquo;{campaign.latin_text}&rdquo;
                  </p>
                </div>
              )}
              {campaign.translation_text && (
                <div className="px-1">
                  <p className="text-xs text-[#404944] leading-relaxed">
                    <span className="font-semibold text-[#003527]">Arti ringkas:</span> &ldquo;
                    {campaign.translation_text}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Ticker Doa & Hajat Jamaah */}
      <div className="px-4 mb-3">
        <div className="bg-[#e2e7ff]/70 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden shadow-sm border border-[#dae2fd]">
          <div className="flex items-center gap-1 shrink-0 text-[#003527]">
            <span
              className="material-symbols-outlined text-[16px] text-[#904d00]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Hajat Jamaah:</span>
          </div>

          <div className="relative overflow-hidden w-full h-5 flex items-center min-w-0">
            <p className="text-xs text-[#131b2e] truncate">
              {currentPrayer ? (
                <>
                  <span className="font-bold text-[#003527]">{currentPrayer.name}:</span> &ldquo;
                  {currentPrayer.prayer_text}&rdquo;
                </>
              ) : (
                <span className="italic text-[#404944]">
                  Belum ada hajat. Klik &quot;Kirim Hajat&quot; untuk menitipkan doa.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Interactive Thumb Tasbih Counter (Centerpiece) */}
      <div className="flex flex-col items-center justify-center px-4 mb-4 select-none">
        {/* User Personal Contribution Counter */}
        <div className="flex flex-col items-center mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f2f3ff] mb-1 shadow-sm border border-[#eaedff]">
            <span className="material-symbols-outlined text-[#904d00] text-[16px]">touch_app</span>
            <span className="text-[11px] text-[#404944] font-medium">
              Kontribusi Pribadi Sesi Ini
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-headline text-3xl text-[#003527] font-bold tracking-tight">
              {personalCount}
            </span>
            <span className="text-xs text-[#404944] font-medium">kali</span>
          </div>

          {/* Optimistic batch syncing indicator */}
          <div className="flex items-center gap-1.5 text-[#404944] mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#904d00] animate-pulse" />
            <span className="text-[10px] text-[#404944]">
              Sinkron ke cloud tiap 5 klik ({batchStep}/5)
            </span>
          </div>
        </div>

        {/* Sacred Thumb Tap Button with Halos */}
        <div className="relative flex items-center justify-center my-2">
          {/* Ambient Outer Pulse Rings */}
          <div
            className={`absolute w-56 h-56 rounded-full bg-[#ffdcc3]/40 blur-md pointer-events-none transition-transform duration-300 ${
              isTapping ? 'scale-110' : 'scale-100'
            }`}
          />
          <div
            className={`absolute w-48 h-48 rounded-full bg-[#b0f0d6]/50 blur-sm pointer-events-none transition-transform duration-200 ${
              isTapping ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Interactive Big Circular Button */}
          <button
            onClick={handleTap}
            type="button"
            aria-label="Ketuk tombol tasbih untuk menambah zikir bersama"
            className={`relative w-44 h-44 rounded-full bg-gradient-to-b from-[#003527] to-[#064e3b] text-white shadow-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group focus:outline-none transition-all duration-150 active:scale-95 ${
              isTapping ? 'scale-95' : 'hover:scale-[1.02]'
            }`}
          >
            {/* Gold manuscript rim ring simulation */}
            <span className="absolute inset-1 rounded-full bg-transparent shadow-[inset_0_0_0_2px_rgba(254,147,44,0.35)] pointer-events-none" />

            {/* Geometric subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
              <svg
                className="w-full h-full text-[#ffdcc3] stroke-current"
                fill="none"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" strokeWidth="1" />
                <circle cx="50" cy="50" r="32" strokeWidth="1" />
                <rect height="50" strokeWidth="1" transform="rotate(45 50 50)" width="50" x="25" y="25" />
              </svg>
            </div>

            <span className="material-symbols-outlined text-[36px] text-[#ffb77d] mb-1 group-hover:scale-110 transition-transform">
              fingerprint
            </span>
            <span className="font-headline text-xl text-white font-bold tracking-wider">
              TAP
            </span>
            <span className="text-[10px] text-[#80bea6] tracking-widest uppercase font-semibold">
              Zikir
            </span>
          </button>
        </div>
      </div>

      {/* 6. Settings & Action Folio Bar */}
      <div className="px-4 flex flex-col gap-2 mb-6">
        {/* Utility Switches (Haptic & Audio) */}
        <div className="bg-[#f2f3ff] rounded-2xl p-2 flex items-center justify-around shadow-sm border border-[#eaedff]">
          <button
            onClick={() => setIsHapticOn(!isHapticOn)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[#003527] hover:bg-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isHapticOn ? 'vibration' : 'mobile_off'}
            </span>
            <span className="text-xs font-bold">
              Getar: {isHapticOn ? 'ON' : 'OFF'}
            </span>
          </button>

          <span className="w-px h-5 bg-[#bfc9c3]/50" />

          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[#003527] hover:bg-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isAudioOn ? 'volume_up' : 'volume_off'}
            </span>
            <span className="text-xs font-bold">
              Suara: {isAudioOn ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Dual Actions: Kirim Hajat & Share Whatsapp */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setIsHajatModalOpen(true)}
            type="button"
            className="h-12 rounded-xl bg-white text-[#003527] border border-[#eaedff] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#eaedff] transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] text-[#904d00]">edit_note</span>
            <span>Kirim Hajat</span>
          </button>

          <ShareSyiarButton
            campaignName={campaign.title}
            campaignSlug={campaign.slug}
            personalCount={personalCount}
            totalCount={campaign.current_count}
            targetCount={campaign.target_count}
            variant="full"
            label="Ajak Berzikir"
          />
        </div>
      </div>

      {/* 7. Khatam Selebrasi Card (If Completed) */}
      {isCompleted && (
        <div className="px-4 mb-6">
          <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#003527] via-[#064e3b] to-[#003527] text-white p-6 shadow-xl text-center overflow-hidden">
            <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[#ffdcc3] mb-3">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider">Khatam Selesai</span>
            </div>

            <p className="font-headline text-2xl text-[#ffdcc3] font-bold mb-1 leading-snug">
              ٱلْحَمْدُ لِلَّٰهِ
            </p>
            <h2 className="font-headline text-lg text-white font-bold mb-2">
              {campaign.target_count.toLocaleString()} Butir Zikir Tuntas
            </h2>
            <p className="text-xs text-[#80bea6] max-w-xs mx-auto mb-4">
              Khatam Zikir Bersama: <span className="text-[#ffdcc3] font-semibold">{campaign.title}</span>
            </p>

            {/* Doa Bersama Khatam */}
            <div className="bg-white/10 rounded-xl p-3.5 mb-3 text-left">
              <p className="font-arabic text-lg text-right text-[#ffdcc3] leading-relaxed mb-2" dir="rtl">
                اللَّهُمَّ تَقَبَّلْ مِنَّا ذِكْرَنَا، وَاجْعَلْهُ نُورًا فِي قُلُوبِنَا، وَفَرَجًا لِكُلِّ مَهْمُومٍ، وَشِفَاءً لِكُلِّ مَرِيضٍ.
              </p>
              <p className="text-[11px] text-white/90 italic leading-relaxed">
                &ldquo;Ya Allah terimalah untaian zikir kami, jadikanlah ia cahaya di hati kami, pembuka jalan bagi yang berduka, penawar bagi yang sakit...&rdquo;
              </p>
            </div>

            <button
              onClick={handleAamiin}
              type="button"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                hasAamiined
                  ? 'bg-[#004f34] text-[#31c98f]'
                  : 'bg-[#fe932c] hover:bg-[#d97706] text-white shadow-md'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span>Aamiin-kan Doa Bersama ({aamiinCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. Bottom Drawer Modal for Submitting Hajat */}
      {isHajatModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="max-w-[480px] mx-auto w-full bg-white rounded-t-3xl p-5 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#904d00] text-[22px]">favorite</span>
                <h3 className="font-headline text-lg font-bold text-[#003527]">
                  Titip Hajat & Doa Jamaah
                </h3>
              </div>
              <button
                onClick={() => setIsHajatModalOpen(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#404944] hover:text-[#131b2e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#404944] leading-relaxed">
              Hajat Anda akan ditampilkan pada running banner live room agar di-aamiin-kan oleh ribuan jamaah yang sedang berzikir.
            </p>

            <form onSubmit={handleHajatSubmit} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#131b2e]">
                  Nama / Hamba Allah
                </label>
                <input
                  type="text"
                  value={hajatName}
                  onChange={(e) => setHajatName(e.target.value)}
                  placeholder="Contoh: Fulan bin Fulan (Surabaya)"
                  className="bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#003527]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#131b2e]">
                  Permohonan Doa *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hajatText}
                  onChange={(e) => setHajatText(e.target.value)}
                  placeholder="Tuliskan hajat kesembuhan, kelancaran rezeki, atau doa terbaik..."
                  className="bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#003527] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingHajat || !hajatText.trim()}
                className="w-full h-11 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{submittingHajat ? 'Mengirimkan...' : 'Kirimkan ke Majelis'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
