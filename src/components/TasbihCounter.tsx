'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import { playTasbihClick, playMilestoneSound, triggerHaptic } from '@/lib/audioHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Smartphone,
  Maximize2,
  Minimize2,
  Sun,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import ShareWhatsAppButton from './ShareWhatsAppButton';

interface TasbihCounterProps {
  campaign: Campaign;
}

export default function TasbihCounter({ campaign: initialCampaign }: TasbihCounterProps) {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
  const [personalCount, setPersonalCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(
    initialCampaign.current_count >= initialCampaign.target_count
  );
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [rippleKey, setRippleKey] = useState<number>(0);

  const { isLocked, requestWakeLock } = useWakeLock();

  // Pending batch queue ref to prevent race conditions
  const pendingBatchRef = useRef<number>(0);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-request wake lock on component mount
  useEffect(() => {
    requestWakeLock();
  }, [requestWakeLock]);

  // Load personal count from LocalStorage for this campaign
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

  // Save personal count to LocalStorage
  const updatePersonalCount = (newVal: number) => {
    setPersonalCount(newVal);
    try {
      localStorage.setItem(`satuzikir_user_${campaign.id}`, newVal.toString());
    } catch {
      // ignore
    }
  };

  // Flush pending batch to server / database
  const flushBatch = useCallback(async () => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    const amount = pendingBatchRef.current;
    if (amount <= 0) return;

    pendingBatchRef.current = 0;
    try {
      const updatedTotal = await DataService.incrementCounter(campaign.id, amount);
      if (updatedTotal > 0) {
        setCampaign((prev) => ({
          ...prev,
          current_count: Math.max(prev.current_count, updatedTotal),
          status: updatedTotal >= prev.target_count ? 'completed' : prev.status,
        }));
      }
    } catch {
      // ignore
    }
  }, [campaign.id]);

  // Flush on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingBatchRef.current > 0) {
        // synchronously flush or beacon if needed
        DataService.incrementCounter(campaign.id, pendingBatchRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (pendingBatchRef.current > 0) {
        DataService.incrementCounter(campaign.id, pendingBatchRef.current);
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, [campaign.id]);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = DataService.subscribeToCampaign(campaign.id, (updated) => {
      setCampaign((prev) => {
        const nextCount = updated.current_count ?? prev.current_count;
        const nextStatus = updated.status ?? prev.status;

        // Trigger celebration if newly completed
        if (nextCount >= prev.target_count && !hasCelebrated) {
          setHasCelebrated(true);
          setShowCelebration(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        }

        return {
          ...prev,
          current_count: Math.max(prev.current_count, nextCount),
          status: nextStatus,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, [campaign.id, hasCelebrated]);

  // Handle Tap Tasbih
  const handleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Visual ripple
    setIsTapping(true);
    setRippleKey((k) => k + 1);
    setTimeout(() => setIsTapping(false), 120);

    // Audio & Haptic feedback
    playTasbihClick(soundEnabled);
    triggerHaptic('tap', hapticEnabled);

    // Optimistic increments
    const nextPersonal = personalCount + 1;
    updatePersonalCount(nextPersonal);

    // Check 33x round milestone
    if (nextPersonal % 33 === 0) {
      playMilestoneSound(soundEnabled);
      triggerHaptic('milestone', hapticEnabled);
    }

    // Accumulate optimistic global count
    const nextGlobal = campaign.current_count + 1;
    setCampaign((prev) => ({
      ...prev,
      current_count: nextGlobal,
      status: nextGlobal >= prev.target_count ? 'completed' : prev.status,
    }));

    // Trigger celebration if target reached
    if (nextGlobal >= campaign.target_count && !hasCelebrated) {
      setHasCelebrated(true);
      setShowCelebration(true);
      triggerHaptic('complete', hapticEnabled);
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
      });
    }

    // Batching logic: flush every 5 taps or debounce 1.5s
    pendingBatchRef.current += 1;
    if (pendingBatchRef.current >= 5) {
      flushBatch();
    } else {
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = setTimeout(() => {
        flushBatch();
      }, 1200);
    }
  };

  const percentage = Math.min(
    100,
    Math.round((campaign.current_count / campaign.target_count) * 100)
  );
  const remaining = Math.max(0, campaign.target_count - campaign.current_count);
  const roundNumber = Math.floor(personalCount / 33) + 1;
  const beadInRound = personalCount % 33;

  return (
    <div
      className={`w-full flex flex-col items-center transition-all ${
        isZenMode
          ? 'fixed inset-0 z-50 bg-emerald-950 p-4 justify-between select-none'
          : 'relative'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-2 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            type="button"
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-800/60 text-amber-300 border border-emerald-700/60'
                : 'bg-emerald-950/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-medium">
              {soundEnabled ? 'Suara Aktif' : 'Bisu'}
            </span>
          </button>

          {/* Haptic Toggle */}
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            type="button"
            title={hapticEnabled ? 'Matikan Getar' : 'Nyalakan Getar'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              hapticEnabled
                ? 'bg-emerald-800/60 text-amber-300 border border-emerald-700/60'
                : 'bg-emerald-950/40 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-medium">
              {hapticEnabled ? 'Getar Aktif' : 'Getar Mati'}
            </span>
          </button>

          {/* Wake Lock Indicator */}
          {isLocked && (
            <span
              title="Layar HP akan tetap menyala selama berzikir"
              className="hidden xs:flex items-center gap-1 text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              Layar Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Reset Personal */}
          <button
            onClick={() => updatePersonalCount(0)}
            type="button"
            title="Reset Hitungan Pribadi Saja"
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-emerald-900/40 text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zen / Fullscreen Toggle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            type="button"
            title={isZenMode ? 'Keluar Mode Zen' : 'Masuk Mode Zen (Layar Penuh)'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer ${
              isZenMode
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg'
                : 'bg-emerald-900/40 text-slate-300 hover:text-white border border-emerald-800/50'
            }`}
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">
              {isZenMode ? 'Tutup Zen' : 'Mode Zen'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Counter Hub & Tasbih Button */}
      <div className="w-full flex flex-col items-center justify-center my-4">
        {/* Big Tap Area */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Halo */}
          <div
            className={`absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-amber-300/30 blur-xl transition-all duration-300 ${
              isTapping ? 'scale-110 opacity-100' : 'opacity-70'
            }`}
          />

          {/* Circular Progress Ring */}
          <svg className="w-72 h-72 sm:w-84 sm:h-84 -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-emerald-950/80"
              strokeWidth="4"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-amber-400 transition-all duration-300 ease-out"
              strokeWidth="4.5"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - percentage / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* The Touchable Button */}
          <button
            onClick={handleTap}
            type="button"
            className={`absolute w-60 h-60 sm:w-70 sm:h-70 rounded-full flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all duration-150 active:scale-95 shadow-2xl ${
              isTapping
                ? 'scale-95 bg-gradient-to-b from-emerald-800 to-emerald-950 shadow-inner'
                : 'bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 hover:border-amber-400/50'
            } border-2 border-amber-500/40 animate-golden-pulse`}
          >
            {/* Ripple Flash */}
            <div
              key={rippleKey}
              className="absolute inset-0 rounded-full bg-amber-400/15 pointer-events-none animate-ping"
            />

            {/* Label */}
            <span className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-300/80 uppercase mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Total Bersama
            </span>

            {/* Large Accumulated Live Count */}
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-mono drop-shadow-md">
              {campaign.current_count.toLocaleString()}
            </span>

            {/* Target Comparison */}
            <span className="text-xs text-amber-300/90 font-medium mt-1">
              dari target {campaign.target_count.toLocaleString()} ({percentage}%)
            </span>

            {/* Tap instruction */}
            <div className="mt-4 px-3 py-1 rounded-full bg-emerald-800/40 border border-emerald-700/50 text-[11px] text-emerald-200 font-medium">
              Sentuh Layar Disini
            </div>
          </button>
        </div>

        {/* Personal Session & Sub-Round Card */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-6">
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">Zikir Pribadi Anda</span>
            <span className="text-xl font-bold text-amber-400 font-mono">
              {personalCount.toLocaleString()}x
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">
              Putaran Ke-{roundNumber}
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xl font-bold text-emerald-300 font-mono">{beadInRound}</span>
              <span className="text-xs text-slate-500">/ 33</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full max-w-md mt-6 px-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300">
              {campaign.status === 'completed'
                ? 'Target Telah Khatam!'
                : `Tersisa ${remaining.toLocaleString()}x lagi`}
            </span>
            <span className="text-amber-400 font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-3 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/60 p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300 transition-all duration-300 shadow-md"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Share to WhatsApp Section */}
      <div className="w-full max-w-md my-4 px-2">
        <ShareWhatsAppButton campaign={campaign} />
      </div>

      {/* Celebration Modal when Target Reached */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-emerald-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 text-center relative shadow-2xl shadow-amber-500/20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>

            <h3 className="text-2xl font-black text-amber-300 mb-1">
              Alhamdulillah!
            </h3>
            <h4 className="text-base font-bold text-slate-100 mb-3">
              Target {campaign.target_count.toLocaleString()}x Telah Tercapai!
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Jazakumullahu khairan katsiran kepada seluruh jamaah yang telah berpartisipasi melantunkan amalan ini. Semoga Allah menerima setiap butir zikir dan mengabulkan segala hajat kita bersama.
            </p>

            <div className="space-y-2.5">
              <ShareWhatsAppButton campaign={campaign} />

              <button
                onClick={() => setShowCelebration(false)}
                type="button"
                className="w-full py-2.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Lanjutkan Berzikir Lebih Banyak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
