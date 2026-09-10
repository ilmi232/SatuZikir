'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import Link from 'next/link';

export default function AdminHubPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states for quick creation
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'syifa' | 'ramadan' | 'tolak-bala' | 'harian'>('syifa');
  const [targetCount, setTargetCount] = useState<number>(4444);
  const [arabicText, setArabicText] = useState('');
  const [latinText, setLatinText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Prompt Generator states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Counter adjustment modal state
  const [selectedForReset, setSelectedForReset] = useState<Campaign | null>(null);
  const [newCountInput, setNewCountInput] = useState<number>(0);

  const handleGenerateWithAi = async (promptToUse?: string) => {
    const textPrompt = promptToUse || aiPrompt;
    if (!textPrompt.trim()) return;

    setIsGeneratingAi(true);
    setAiError(null);
    setAiSource(null);
    setAiSuccessMsg(null);

    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textPrompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.campaign) {
        throw new Error(data.error || 'Gagal menghasilkan campaign.');
      }

      const c = data.campaign;
      setTitle(c.title || '');
      setTargetCount(Number(c.target_count) || 10000);
      setCategory(c.category || 'syifa');
      setArabicText(c.arabic_text || '');
      setLatinText(c.latin_text || '');
      setTranslationText(c.translation_text || '');
      setDescription(c.description || '');
      setAiSource(data.source === 'gemini-ai' ? 'Google Gemini AI' : 'SatuZikir Knowledge Engine');
      setAiSuccessMsg('Campaign berhasil disusun oleh AI! Formulir di bawah telah terisi otomatis.');

      // Scroll smoothly to the form
      setTimeout(() => {
        const formEl = document.getElementById('manual-campaign-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setAiError((err as Error).message || 'Gagal memproses prompt AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('satuzikir_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    loadCampaigns();
  }, [router]);

  const loadCampaigns = async () => {
    setLoading(true);
    const data = await DataService.getCampaigns();
    setCampaigns(data);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('satuzikir_admin_auth');
    router.push('/admin/login');
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !arabicText.trim() || !targetCount) return;

    setIsSubmitting(true);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || `campaign-${Date.now()}`;

    try {
      await DataService.saveCampaign({
        title: title.trim(),
        slug,
        category,
        description: description.trim() || `Amalan zikir bersama jamaah SatuZikir untuk kemudahan dan keberkahan.`,
        arabic_text: arabicText.trim(),
        latin_text: latinText.trim(),
        translation_text: translationText.trim() || latinText.trim(),
        target_count: Number(targetCount),
        current_count: 0,
        status,
      });

      setTitle('');
      setArabicText('');
      setLatinText('');
      setTranslationText('');
      setDescription('');
      setAiSuccessMsg(null);
      setAiSource(null);
      alert('Campaign Zikir Berhasil Didaftarkan & Disinkronkan!');
      await loadCampaigns();
    } catch {
      alert('Terjadi kesalahan saat membuat campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveReset = async () => {
    if (!selectedForReset) return;
    await DataService.saveCampaign({
      ...selectedForReset,
      current_count: Number(newCountInput),
      status: Number(newCountInput) >= selectedForReset.target_count ? 'completed' : selectedForReset.status,
    });
    setSelectedForReset(null);
    await loadCampaigns();
  };

  const handleCloseCampaign = async (campaign: Campaign) => {
    if (confirm(`Tutup campaign "${campaign.title}"?`)) {
      await DataService.saveCampaign({
        ...campaign,
        status: 'completed',
      });
      await loadCampaigns();
    }
  };

  const totalZikir = campaigns.reduce((acc, c) => acc + Number(c.current_count), 0);
  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#eaedff] border-t-[#003527] animate-spin mb-3" />
        <p className="text-xs text-[#404944]">Memuat data admin...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 py-2 space-y-4">
      {/* 1. Admin Sub-Header Status Bar */}
      <div className="flex flex-col bg-[#f2f3ff] rounded-2xl p-4 shadow-sm border border-[#eaedff]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#904d00] font-bold">
              Pusat Kendali Jamaah
            </span>
            <h1 className="font-headline text-xl text-[#003527] font-bold mt-0.5">
              Admin Hub Campaign
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-pulse" />
              v2.4 Live
            </span>
            <button
              onClick={handleLogout}
              title="Keluar Admin"
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-full text-[#404944] hover:text-[#ba1a1a] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>

        {/* Health Badges */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#eaedff]">
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-[#eaedff]">
            <span className="material-symbols-outlined text-[18px] text-[#003623]">bolt</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#404944] truncate">Supabase Realtime</span>
              <span className="text-xs text-[#003527] font-bold">Channel: Aktif</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl shadow-sm border border-[#eaedff]">
            <span className="material-symbols-outlined text-[18px] text-[#904d00]">speed</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#404944] truncate">Concurrency Load</span>
              <span className="text-xs text-[#904d00] font-bold">Normal (42 ms)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ringkasan Statistik Live */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-base text-[#131b2e] font-bold">Metrik Live Zikir</h2>
          <span className="text-[10px] text-[#404944]">Update: Tiap 1 Detik</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col bg-white p-2.5 rounded-2xl shadow-sm border border-[#eaedff] text-center">
            <span className="material-symbols-outlined text-[18px] text-[#003527] mx-auto mb-1">
              campaign
            </span>
            <span className="text-[10px] text-[#404944]">Aktif</span>
            <span className="font-headline text-lg text-[#003527] font-bold mt-0.5">
              {activeCount}
            </span>
            <span className="text-[9px] text-[#31c98f] font-semibold">Campaign</span>
          </div>

          <div className="flex flex-col bg-white p-2.5 rounded-2xl shadow-sm border border-[#eaedff] text-center">
            <span className="material-symbols-outlined text-[18px] text-[#904d00] mx-auto mb-1">
              touch_app
            </span>
            <span className="text-[10px] text-[#404944]">Terkumpul</span>
            <span className="font-headline text-lg text-[#904d00] font-bold mt-0.5 font-mono">
              {totalZikir.toLocaleString()}
            </span>
            <span className="text-[9px] text-[#904d00] font-semibold">+148/mnt</span>
          </div>

          <div className="flex flex-col bg-white p-2.5 rounded-2xl shadow-sm border border-[#eaedff] text-center">
            <span className="material-symbols-outlined text-[18px] text-[#003623] mx-auto mb-1">
              group
            </span>
            <span className="text-[10px] text-[#404944]">Jamaah</span>
            <span className="font-headline text-lg text-[#131b2e] font-bold mt-0.5 font-mono">
              1.820
            </span>
            <span className="text-[9px] text-[#404944]">Hari ini</span>
          </div>
        </div>

        {/* Visual Monitoring Sparkline Per Jam */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaedff] mt-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#003527]">
                monitoring
              </span>
              <span className="text-xs text-[#003527] font-bold">Trafik Tap Jamaah / Jam</span>
            </div>
            <span className="text-[10px] text-[#404944]">Puncak: 20:00 - 21:00</span>
          </div>

          <div className="flex items-end justify-between h-16 pt-2 px-1 gap-1.5">
            {[
              { time: '16:00', h: '28%', active: false },
              { time: '17:00', h: '42%', active: false },
              { time: '18:00', h: '78%', active: false },
              { time: '19:00', h: '65%', active: false },
              { time: '20:00', h: '100%', active: true },
              { time: '21:00', h: '84%', active: false },
              { time: 'Live', h: '52%', active: false, isLive: true },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t transition-all ${
                    bar.isLive
                      ? 'bg-[#fe932c] animate-pulse'
                      : bar.active
                      ? 'bg-[#003527] relative'
                      : 'bg-[#e2e7ff]'
                  }`}
                  style={{ height: bar.h }}
                />
                <span
                  className={`text-[9px] font-semibold ${
                    bar.isLive
                      ? 'text-[#904d00]'
                      : bar.active
                      ? 'text-[#003527]'
                      : 'text-[#404944]'
                  }`}
                >
                  {bar.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2.5. AI Campaign Generator (Apple iOS Glassmorphism) */}
      <div className="relative overflow-hidden rounded-3xl p-5 backdrop-blur-2xl bg-white/70 dark:bg-[#0d1410]/75 border border-white/80 dark:border-white/[0.09] shadow-[0_8px_32px_rgba(0,53,39,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.03] dark:ring-white/[0.05] space-y-4 transition-all">
        {/* Subtle Ambient Light Orbs */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-[#31c98f]/20 via-[#ffdcc3]/15 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-[#003527]/10 via-[#31c98f]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-white to-white/50 dark:from-white/15 dark:to-white/5 border border-white/90 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#003527] dark:text-[#4edea3] backdrop-blur-md">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-lg font-bold text-[#131b2e] dark:text-[#f0fdf4] tracking-tight">
                  Buat Campaign via AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#003527]/5 dark:bg-[#4edea3]/10 text-[#003527] dark:text-[#4edea3] border border-[#003527]/10 dark:border-[#4edea3]/20">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-[#404944] dark:text-[#9cb8a2]">
                Satu ketikan prompt, tersusun otomatis lafadz Arab berharakat & fadhilahnya
              </p>
            </div>
          </div>
        </div>

        {/* Frosted Prompt Input Area */}
        <div className="relative z-10 flex flex-col space-y-2.5">
          <div className="relative">
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Tuliskan hajat atau nama wirid... (misal: Shalawat Nariyah 4.444x untuk kesembuhan)"
              className="w-full bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-[#131b2e] dark:text-[#f0fdf4] placeholder:text-[#404944]/45 dark:placeholder:text-[#9cb8a2]/40 text-xs px-3.5 py-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:border-[#003527]/30 dark:focus:border-[#4edea3]/40 focus:bg-white dark:focus:bg-white/[0.08] focus:ring-4 focus:ring-[#003527]/5 dark:focus:ring-[#4edea3]/10 outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* iOS-Style Pill Capsules for Quick Inspiration */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              { label: '🌿 Shalawat Nariyah 4.444x', prompt: 'Buat campaign Shalawat Nariyah 4.444x untuk kelapangan hajat dan kesembuhan saudara yang sakit' },
              { label: '🛡️ Hasbunallah 10.000x', prompt: 'Buat campaign Hasbunallah Wa Ni\'mal Wakil 10.000x untuk tolak bala, bencana, dan keselamatan umat' },
              { label: '🤲 Istighfar 100.000x', prompt: 'Buat campaign Istighfar 100.000x pelebur dosa dan pembuka pintu rezeki berkah' },
              { label: '🌙 Tibbil Qulub 1.000x', prompt: 'Buat campaign Shalawat Tibbil Qulub 1.000x obat penawar hati dan kesehatan jiwa raga' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiPrompt(chip.prompt);
                  handleGenerateWithAi(chip.prompt);
                }}
                disabled={isGeneratingAi}
                className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] text-[10px] font-semibold text-[#003527] dark:text-[#e8f5e9] border border-black/[0.05] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-md transition-all duration-150 cursor-pointer active:scale-95 shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Primary Sleek Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerateWithAi()}
            disabled={isGeneratingAi || !aiPrompt.trim()}
            className="w-full h-11 rounded-2xl bg-[#003527] hover:bg-[#064e3b] dark:bg-[#4edea3] dark:hover:bg-[#31c98f] text-white dark:text-[#002117] text-xs font-bold shadow-[0_4px_16px_rgba(0,53,39,0.18)] dark:shadow-[0_4px_16px_rgba(78,222,163,0.2)] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGeneratingAi ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Menyusun Format Lengkap...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                <span>Ramu Campaign dengan AI</span>
              </>
            )}
          </button>
        </div>

        {/* AI Success Feedback Toast Banner */}
        {aiSuccessMsg && (
          <div className="relative z-10 p-3 rounded-2xl bg-[#004f34]/10 dark:bg-[#4edea3]/10 border border-[#004f34]/20 dark:border-[#4edea3]/25 backdrop-blur-md flex items-center justify-between gap-2 text-xs text-[#003527] dark:text-[#4edea3] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-semibold truncate">{aiSuccessMsg}</span>
            </div>
            <span className="text-[10px] opacity-75 shrink-0 px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-mono">
              {aiSource || 'AI'}
            </span>
          </div>
        )}

        {/* AI Error Feedback */}
        {aiError && (
          <div className="relative z-10 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[18px] shrink-0">
              error
            </span>
            <span className="font-medium">{aiError}</span>
          </div>
        )}
      </div>

      {/* 3. Form Cepat: Buat Campaign Baru */}
      <div id="manual-campaign-form" className="flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#b0f0d6] flex items-center justify-center text-[#003527]">
              <span className="material-symbols-outlined text-[16px]">add_task</span>
            </div>
            <div>
              <h2 className="font-headline text-base text-[#131b2e] font-bold">
                Formulir Pendaftaran Campaign
              </h2>
              <p className="text-[10px] text-[#404944]">Tinjau dan sesuaikan detail sebelum publikasi</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#ffdcc3] text-[#2f1500] text-[10px] font-bold rounded-full">
            Admin
          </span>
        </div>

        <form onSubmit={handleCreateCampaign} className="space-y-2.5">
          {/* Judul */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Judul Campaign *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Shalawat Tibbil Qulub 10.000x"
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2.5 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527]"
            />
          </div>

          {/* Kategori & Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-[#131b2e]">Kategori</label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as 'syifa' | 'ramadan' | 'tolak-bala' | 'harian')
                }
                className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-2.5 py-2.5 rounded-xl outline-none"
              >
                <option value="syifa">Hajat & Syifa</option>
                <option value="ramadan">Ramadan & Harian</option>
                <option value="tolak-bala">Tolak Bala & Duka</option>
                <option value="harian">Wirid Harian</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-xs font-bold text-[#131b2e]">Status Awal</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft')}
                className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-2.5 py-2.5 rounded-xl outline-none"
              >
                <option value="active">Langsung Aktif</option>
                <option value="draft">Simpan Draft</option>
              </select>
            </div>
          </div>

          {/* Target & Presets */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#131b2e]">Target Hitungan Total *</label>
              <span className="text-[10px] text-[#404944]">Preset cepat:</span>
            </div>
            <input
              type="number"
              required
              min={1}
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527] font-mono"
            />
            <div className="flex items-center gap-1.5 pt-1">
              {[1000, 4444, 10000, 70000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetCount(preset)}
                  className="flex-1 py-1 rounded-lg bg-[#e2e7ff] hover:bg-[#dae2fd] text-[10px] font-bold text-[#131b2e] transition-colors cursor-pointer"
                >
                  {preset.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Lafadz Arab */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Teks Lafadz Arab (dengan Harakat) *</label>
            <input
              type="text"
              required
              dir="rtl"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              placeholder="اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ"
              className="w-full bg-[#f2f3ff] text-[#003527] font-arabic text-lg px-3 py-2 rounded-xl outline-none text-right focus:bg-white focus:ring-1 focus:ring-[#003527]"
            />
          </div>

          {/* Transliterasi Latin */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">
              Transliterasi Latin
            </label>
            <textarea
              rows={2}
              value={latinText}
              onChange={(e) => setLatinText(e.target.value)}
              placeholder="Allâhumma shalli 'alâ sayyidinâ Muhammadin..."
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527] resize-none"
            />
          </div>

          {/* Arti / Terjemahan */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">
              Arti / Terjemahan Bahasa Indonesia
            </label>
            <textarea
              rows={2}
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              placeholder="Ya Allah, limpahkanlah rahmat kepada junjungan kami..."
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527] resize-none"
            />
          </div>

          {/* Deskripsi & Fadhilah */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">
              Deskripsi Hikmah & Fadhilah
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penjelasan hikmah dan ajakan menyatukan niat zikir..."
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">broadcast_on_personal</span>
            <span>{isSubmitting ? 'Memublikasikan...' : 'Publikasikan ke Jamaah Live'}</span>
          </button>
        </form>
      </div>

      {/* 4. Daftar Campaign Berjalan */}
      <div className="flex flex-col space-y-2.5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-base text-[#131b2e] font-bold">
              Daftar Campaign Berjalan
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-ping" />
          </div>
          <span className="text-[10px] text-[#404944]">{campaigns.length} Campaign</span>
        </div>

        {campaigns.map((c) => {
          const percent = Math.min(100, Math.round((c.current_count / c.target_count) * 100));
          return (
            <div
              key={c.id}
              className="flex flex-col bg-white p-3.5 rounded-2xl shadow-sm border border-[#eaedff] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdcc3] text-[#2f1500]">
                      {c.category === 'ramadan'
                        ? 'Ramadan'
                        : c.category === 'tolak-bala'
                        ? 'Tolak Bala'
                        : 'Hajat & Syifa'}
                    </span>
                    <span className="text-[10px] text-[#31c98f] font-semibold flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-[#31c98f]" />
                      Atomic Counter
                    </span>
                  </div>

                  <h3 className="font-headline text-sm font-bold text-[#003527] mt-0.5 truncate">
                    {c.title}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-[#404944]">Target</span>
                  <p className="font-headline text-sm font-bold text-[#131b2e]">
                    {c.target_count.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#003527] font-bold">
                    {c.current_count.toLocaleString()} Selesai
                  </span>
                  <span className="text-[#404944] font-medium">{percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden">
                  <div
                    className="h-full bg-[#003527] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <Link
                  href={`/campaign/${c.slug}`}
                  className="text-[11px] font-bold text-[#003527] flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[15px]">sensors</span>
                  <span>Buka Layar Zikir</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedForReset(c);
                      setNewCountInput(c.current_count);
                    }}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#404944] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                    <span>Koreksi</span>
                  </button>

                  <button
                    onClick={() => handleCloseCampaign(c)}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-[#ffdad6] text-[#93000a] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                    <span>Tutup</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Koreksi / Reset Counter */}
      {selectedForReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3">
            <h3 className="font-headline text-lg font-bold text-[#003527]">
              Koreksi Hitungan
            </h3>
            <p className="text-xs text-[#404944] line-clamp-1">{selectedForReset.title}</p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#131b2e]">Jumlah Saat Ini</label>
              <input
                type="number"
                min={0}
                value={newCountInput}
                onChange={(e) => setNewCountInput(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-[#f2f3ff] text-[#131b2e] text-sm px-3 py-2 rounded-xl outline-none font-mono"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewCountInput(0)}
                  className="flex-1 py-1 rounded-lg bg-[#f2f3ff] text-[11px] font-semibold text-[#404944]"
                >
                  Reset ke 0
                </button>
                <button
                  type="button"
                  onClick={() => setNewCountInput(selectedForReset.target_count)}
                  className="flex-1 py-1 rounded-lg bg-[#ffdcc3] text-[11px] font-bold text-[#2f1500]"
                >
                  Set Penuh ({selectedForReset.target_count})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedForReset(null)}
                type="button"
                className="px-3.5 py-2 text-xs font-bold text-[#404944]"
              >
                Batal
              </button>
              <button
                onClick={handleSaveReset}
                type="button"
                className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
