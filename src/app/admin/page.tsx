'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import { checkSupabaseHealth, isSupabaseConfigured, SupabaseHealthResult } from '@/lib/supabase';
import { SUPABASE_PRODUCTION_SQL } from '@/lib/supabaseSql';
import Link from 'next/link';

export default function AdminHubPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Supabase Live & Migration states
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthResult | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isMigratingData, setIsMigratingData] = useState(false);
  const [migrationStatusMsg, setMigrationStatusMsg] = useState<string | null>(null);
  const [showSqlGuideModal, setShowSqlGuideModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

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
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);

  // Counter adjustment modal state
  const [selectedForReset, setSelectedForReset] = useState<Campaign | null>(null);
  const [newCountInput, setNewCountInput] = useState<number>(0);
  const [campaignFilter, setCampaignFilter] = useState<'semua' | 'active' | 'completed'>('semua');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAiImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWithAi = async (promptToUse?: string) => {
    const textPrompt = promptToUse || aiPrompt;
    if (!textPrompt.trim() && !aiImage) return;

    setIsGeneratingAi(true);
    setAiError(null);
    setAiSource(null);
    setAiSuccessMsg(null);

    try {
      const payload: any = { prompt: textPrompt.trim() };
      if (aiImage) payload.image = aiImage;
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      if (data.source === 'nvidia-nim' || data.source === 'kimi-k3') {
        const modelLabel = data.modelName ? `${data.modelName} (NVIDIA NIM)` : 'NVIDIA NIM AI';
        setAiSource(modelLabel);
        setAiSuccessMsg(`Campaign berhasil disusun oleh ${modelLabel}!`);
      } else if (data.source === 'gemini-ai') {
        setAiSource('Google Gemini AI');
        setAiSuccessMsg('Campaign berhasil disusun oleh Google Gemini AI!');
      } else {
        setAiSource('SatuZikir Knowledge Engine');
        setAiSuccessMsg('Disusun oleh Database Syiar SatuZikir (Mode Cerdas Cadangan).');
      }

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
    testSupabase();
  }, [router]);

  const testSupabase = async () => {
    setIsTestingSupabase(true);
    const res = await checkSupabaseHealth();
    setSupabaseHealth(res);
    setIsTestingSupabase(false);
  };

  const handleSyncLocalToSupabase = async () => {
    setIsMigratingData(true);
    setMigrationStatusMsg(null);
    const res = await DataService.migrateLocalToSupabase();
    if (res.success) {
      setMigrationStatusMsg(`Alhamdulillah! Berhasil menyinkronkan ${res.migrated} amalan ke Supabase Live.`);
      await loadCampaigns();
    } else {
      setMigrationStatusMsg(`Gagal: ${res.error}`);
    }
    setIsMigratingData(false);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_PRODUCTION_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      alert('Gagal menyalin SQL.');
    }
  };

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
    if (confirm(`Tutup majelis "${campaign.title}"? Majelis ini akan ditandai selesai dan disembunyikan dari beranda publik aktif.`)) {
      await DataService.saveCampaign({
        ...campaign,
        status: 'completed',
      });
      await loadCampaigns();
    }
  };

  const handleReopenCampaign = async (campaign: Campaign) => {
    if (confirm(`Buka kembali majelis "${campaign.title}" agar kembali aktif di beranda?`)) {
      await DataService.saveCampaign({
        ...campaign,
        status: 'active',
      });
      await loadCampaigns();
    }
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (confirm(`Yakin ingin MENGHAPUS PERMANEN campaign "${campaign.title}"? Seluruh data hitungan tidak dapat dipulihkan.`)) {
      await DataService.deleteCampaign(campaign.id);
      await loadCampaigns();
    }
  };

  const totalZikir = campaigns.reduce((acc, c) => acc + Number(c.current_count), 0);
  const activeCount = campaigns.filter((c) => c.status !== 'completed').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;

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

        {/* Supabase Live Production Console & Migration Status */}
        <div className="mt-3 pt-3 border-t border-[#eaedff] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    supabaseHealth?.connected ? 'bg-[#31c98f]' : 'bg-[#fe932c]'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    supabaseHealth?.connected ? 'bg-[#31c98f]' : 'bg-[#fe932c]'
                  }`}
                />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#003527]">
                  {supabaseHealth?.connected
                    ? 'Supabase Production Live'
                    : isSupabaseConfigured
                    ? 'Menghubungkan ke Supabase...'
                    : 'Mode Demo (Local Storage)'}
                </span>
                <span className="text-[10px] text-[#404944]">
                  {supabaseHealth?.connected
                    ? `Tersambung • Latency: ${supabaseHealth.latencyMs} ms`
                    : isSupabaseConfigured
                    ? supabaseHealth?.error || 'Sedang memeriksa koneksi...'
                    : 'Belum terhubung ke database cloud Supabase'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={testSupabase}
                disabled={isTestingSupabase}
                type="button"
                title="Uji Ulang Koneksi"
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#eaedff] text-[#003527] text-[11px] font-semibold border border-[#eaedff] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[15px] ${isTestingSupabase ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isTestingSupabase ? 'Cek...' : 'Uji Ping'}</span>
              </button>

              <button
                onClick={() => setShowSqlGuideModal(true)}
                type="button"
                className="px-2.5 py-1 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">database</span>
                <span>Setup SQL</span>
              </button>
            </div>
          </div>

          {/* Action Row if Supabase is connected or demo mode */}
          {supabaseHealth?.connected && (
            <div className="flex items-center justify-between bg-emerald-50 rounded-xl p-2 border border-emerald-200">
              <span className="text-[11px] text-[#003527] font-medium">
                Sinkronkan amalan lokal ke database cloud live:
              </span>
              <button
                onClick={handleSyncLocalToSupabase}
                disabled={isMigratingData}
                type="button"
                className="px-3 py-1 rounded-lg bg-[#003527] hover:bg-[#064e3b] text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isMigratingData ? 'Menyinkronkan...' : 'Upload Data Lokal'}
              </button>
            </div>
          )}

          {migrationStatusMsg && (
            <div className="p-2 rounded-xl bg-[#ffdcc3] text-[#2f1500] text-xs font-semibold animate-in fade-in duration-200">
              {migrationStatusMsg}
            </div>
          )}
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
            <span className="text-[9px] text-[#904d00] font-semibold">Real-Time</span>
          </div>

          <div className="flex flex-col bg-white p-2.5 rounded-2xl shadow-sm border border-[#eaedff] text-center">
            <span className="material-symbols-outlined text-[18px] text-[#003623] mx-auto mb-1">
              tour
            </span>
            <span className="text-[10px] text-[#404944]">Total Target</span>
            <span className="font-headline text-lg text-[#131b2e] font-bold mt-0.5 font-mono">
              {campaigns.reduce((acc, c) => acc + (c.target_count || 0), 0).toLocaleString()}
            </span>
            <span className="text-[9px] text-[#404944]">Butir</span>
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
              placeholder="Tuliskan hajat, nama wirid, atau upload foto dari buku/kitab..."
              className="w-full bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-[#131b2e] dark:text-[#f0fdf4] placeholder:text-[#404944]/45 dark:placeholder:text-[#9cb8a2]/40 text-xs px-3.5 py-3 pb-12 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] focus:border-[#003527]/30 dark:focus:border-[#4edea3]/40 focus:bg-white dark:focus:bg-white/[0.08] focus:ring-4 focus:ring-[#003527]/5 dark:focus:ring-[#4edea3]/10 outline-none transition-all duration-200 resize-none"
            />
            
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#eaedff] dark:bg-white/10 text-[#003527] dark:text-[#4edea3] cursor-pointer hover:bg-[#d0d8ff] dark:hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {aiImage && (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#eaedff] dark:border-white/10">
                    <img src={aiImage} alt="Preview" className="object-cover w-full h-full" />
                    <button 
                      onClick={() => setAiImage(null)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#404944]/50 dark:text-[#9cb8a2]/50">Mendukung OCR & Kitab Kuning</span>
            </div>
          </div>

          {/* iOS-Style Pill Capsules for Quick Inspiration */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            {[
              { label: 'Tasbih Malaikat 100x', prompt: 'Tasbih Malaikat 100x pembuka rezeki' },
              { label: 'Ya Kabir 232x', prompt: 'Asmaul Husna Ya Kabir 232x untuk kemuliaan dan rezeki' },
              { label: 'Al-Fatihah 100x', prompt: 'Surah Al-Fatihah 100x' },
              { label: 'Ayat Kursi 313x', prompt: 'Ayat Kursi 313x' },
              { label: 'Shalawat Jibril 10000x', prompt: 'Shalawat Jibril 10000x penarik rezeki' },
              { label: 'Ya Lathif 129x', prompt: 'Ya Lathif 129x pelembut hati' },
              { label: 'Doa Nabi Yunus 1000x', prompt: 'Doa Nabi Yunus 1000x pelepas kesedihan' },
              { label: 'Shalawat Munjiyat 1000x', prompt: 'Shalawat Munjiyat 1000x penyelamat kesulitan' },
              { label: 'Tahlil 70000x', prompt: 'Tahlil Laa ilaaha illallah 70000x' },
              { label: 'Sayyidul Istighfar 100x', prompt: 'Sayyidul Istighfar 100x' },
              { label: 'Shalawat Fatih 1000x', prompt: 'Shalawat Fatih 1000x pembuka kebaikan' },
              { label: 'Surah Al-Ikhlas 1000x', prompt: 'Surah Al-Ikhlas 1000x' },
              { label: 'Shalawat Nariyah 4444x', prompt: 'Shalawat Nariyah 4444x' },
              { label: 'Hasbunallah 10000x', prompt: 'Hasbunallah 10000x tolak bala' },
              { label: 'Istighfar 100000x', prompt: 'Istighfar 100000x pelebur dosa' },
              { label: 'Tibbil Qulub 1000x', prompt: 'Tibbil Qulub 1000x syifa' },
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
              Daftar Campaign & Majelis
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-ping" />
          </div>
          <span className="text-[10px] text-[#404944]">{campaigns.length} Total</span>
        </div>

        {/* Filter Tab: Semua | Aktif | Selesai / Ditutup */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'semua', label: `Semua (${campaigns.length})` },
            { id: 'active', label: `Aktif (${activeCount})` },
            { id: 'completed', label: `Selesai / Ditutup (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCampaignFilter(tab.id as 'semua' | 'active' | 'completed')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                campaignFilter === tab.id
                  ? 'bg-[#003527] text-white shadow-sm'
                  : 'bg-[#eaedff] text-[#404944] hover:bg-[#e2e7ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {campaigns
          .filter((c) => {
            if (campaignFilter === 'active') return c.status !== 'completed';
            if (campaignFilter === 'completed') return c.status === 'completed';
            return true;
          })
          .map((c) => {
            const percent = Math.min(100, Math.round((c.current_count / c.target_count) * 100));
            const isClosed = c.status === 'completed';

            return (
              <div
                key={c.id}
                className={`flex flex-col bg-white p-3.5 rounded-2xl shadow-sm border space-y-2 transition-all ${
                  isClosed ? 'border-[#ffdad6] opacity-85' : 'border-[#eaedff]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdcc3] text-[#2f1500]">
                        {c.category === 'ramadan'
                          ? 'Ramadan'
                          : c.category === 'tolak-bala'
                          ? 'Tolak Bala'
                          : c.category === 'harian'
                          ? 'Harian'
                          : 'Hajat & Syifa'}
                      </span>
                      {isClosed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#93000a] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Selesai / Ditutup
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#b0f0d6] text-[#003527] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#31c98f] animate-pulse" />
                          Majelis Aktif
                        </span>
                      )}
                    </div>

                    <h3 className="font-headline text-sm font-bold text-[#003527] mt-1 truncate">
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
                      className={`h-full rounded-full transition-all duration-500 ${
                        isClosed ? 'bg-[#904d00]' : 'bg-[#003527]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
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

                    {isClosed ? (
                      <button
                        onClick={() => handleReopenCampaign(c)}
                        type="button"
                        title="Buka kembali majelis agar aktif"
                        className="px-2.5 py-1 rounded-lg bg-[#b0f0d6] hover:bg-[#80e5be] text-[#003527] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">play_circle</span>
                        <span>Buka Lagi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCloseCampaign(c)}
                        type="button"
                        title="Tutup majelis ini"
                        className="px-2.5 py-1 rounded-lg bg-[#ffdcc3] hover:bg-[#ffdad6] text-[#904d00] hover:text-[#93000a] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                        <span>Tutup</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteCampaign(c)}
                      type="button"
                      title="Hapus permanen majelis ini"
                      className="px-2 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#ffdad6] text-[#404944] hover:text-[#93000a] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Hapus</span>
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

      {/* Modal Panduan & Salin Skema SQL Supabase */}
      {showSqlGuideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] bg-white rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden border border-[#eaedff]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[22px] text-[#003527]">database</span>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#003527]">
                    Panduan Migrasi Supabase Live
                  </h3>
                  <p className="text-[11px] text-[#404944]">3 Langkah Cepat Setup PostgreSQL Production</p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlGuideModal(false)}
                type="button"
                className="w-8 h-8 rounded-full bg-[#eaedff] flex items-center justify-center text-[#404944] hover:text-[#131b2e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs text-[#131b2e]">
              <div className="bg-[#f2f3ff] p-3 rounded-2xl space-y-1.5 border border-[#eaedff]">
                <div className="flex items-center gap-1.5 font-bold text-[#003527]">
                  <span className="w-5 h-5 rounded-full bg-[#003527] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Buat Proyek Supabase</span>
                </div>
                <p className="text-[11px] text-[#404944] pl-6.5">
                  Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#904d00] font-bold underline">supabase.com</a> dan buat proyek baru (Region: Singapore untuk latency terendah di Indonesia).
                </p>
              </div>

              <div className="bg-[#f2f3ff] p-3 rounded-2xl space-y-1.5 border border-[#eaedff]">
                <div className="flex items-center gap-1.5 font-bold text-[#003527]">
                  <span className="w-5 h-5 rounded-full bg-[#003527] text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Jalankan Script Skema SQL</span>
                </div>
                <p className="text-[11px] text-[#404944] pl-6.5">
                  Buka menu <strong>SQL Editor</strong> di dashboard Supabase, klik <em>New query</em>, lalu tempel seluruh script SQL di bawah ini dan klik <strong>Run</strong>.
                </p>
                <div className="pl-6.5 pt-1">
                  <button
                    onClick={handleCopySql}
                    type="button"
                    className="w-full py-2 px-3 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedSql ? 'check_circle' : 'content_copy'}
                    </span>
                    <span>{copiedSql ? 'Skema SQL Berhasil Disalin! 📋' : 'Salin Seluruh SQL Skema (1-Klik)'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#f2f3ff] p-3 rounded-2xl space-y-1.5 border border-[#eaedff]">
                <div className="flex items-center gap-1.5 font-bold text-[#003527]">
                  <span className="w-5 h-5 rounded-full bg-[#003527] text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Pasang Kredensial di .env.local</span>
                </div>
                <p className="text-[11px] text-[#404944] pl-6.5 leading-relaxed">
                  Buka menu <strong>Project Settings → API</strong> di Supabase. Salin URL dan anon key ke file <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code>:
                </p>
                <pre className="bg-[#131b2e] text-[#ffdcc3] p-2.5 rounded-xl font-mono text-[10px] overflow-x-auto select-all">
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
                </pre>
              </div>

              {/* Preview box */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#404944]">Intip Potongan SQL:</span>
                <pre className="bg-[#002d20] text-[#80bea6] p-2 rounded-xl text-[10px] font-mono h-24 overflow-y-auto">
                  {SUPABASE_PRODUCTION_SQL.slice(0, 500)}...
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
              <button
                onClick={() => setShowSqlGuideModal(false)}
                type="button"
                className="px-4 py-2 text-xs font-bold text-[#404944] hover:text-[#131b2e] cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handleCopySql}
                type="button"
                className="px-4 py-2 bg-[#fe932c] hover:bg-[#d97706] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
