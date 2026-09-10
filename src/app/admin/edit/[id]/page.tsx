'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import Link from 'next/link';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<'syifa' | 'ramadan' | 'tolak-bala' | 'harian'>('syifa');
  const [targetCount, setTargetCount] = useState<number>(4444);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [arabicText, setArabicText] = useState('');
  const [latinText, setLatinText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'draft'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('satuzikir_admin_auth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }

    if (!id) return;
    DataService.getCampaigns().then((list) => {
      const found = list.find((c) => c.id === id || c.slug === id);
      if (found) {
        setCampaign(found);
        setTitle(found.title);
        setSlug(found.slug);
        setCategory(found.category || 'syifa');
        setTargetCount(found.target_count);
        setCurrentCount(found.current_count);
        setArabicText(found.arabic_text);
        setLatinText(found.latin_text || '');
        setTranslationText(found.translation_text || '');
        setDescription(found.description || '');
        setStatus(found.status);
      }
      setLoading(false);
    });
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !title.trim() || !arabicText.trim() || !targetCount) return;

    setIsSubmitting(true);
    try {
      await DataService.saveCampaign({
        id: campaign.id,
        title: title.trim(),
        slug: slug.trim() || campaign.slug,
        category,
        description: description.trim(),
        arabic_text: arabicText.trim(),
        latin_text: latinText.trim(),
        translation_text: translationText.trim(),
        target_count: Number(targetCount),
        current_count: Number(currentCount) || 0,
        status,
      });

      router.push('/admin');
    } catch {
      alert('Terjadi kesalahan saat menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#eaedff] border-t-[#003527] animate-spin mb-3" />
        <p className="text-xs text-[#404944]">Memuat data amalan...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-[#404944] mb-4">Amalan tidak ditemukan.</p>
        <Link href="/admin" className="px-4 py-2 bg-[#003527] text-white text-xs font-bold rounded-xl">
          Kembali ke Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 py-2 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#404944] hover:text-[#003527]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali</span>
        </Link>
        <h1 className="font-headline text-lg font-bold text-[#003527]">Edit Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eaedff] space-y-3">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-[#131b2e]">Judul Amalan *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2.5 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#003527]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Target Hitungan *</label>
            <input
              type="number"
              required
              min={1}
              value={targetCount}
              onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none font-mono"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Hitungan Saat Ini</label>
            <input
              type="number"
              min={0}
              value={currentCount}
              onChange={(e) => setCurrentCount(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'syifa' | 'ramadan' | 'tolak-bala' | 'harian')}
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-2.5 py-2 rounded-xl outline-none"
            >
              <option value="syifa">Hajat & Syifa</option>
              <option value="ramadan">Ramadan & Harian</option>
              <option value="tolak-bala">Tolak Bala & Duka</option>
              <option value="harian">Wirid Harian</option>
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-[#131b2e]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'draft')}
              className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-2.5 py-2 rounded-xl outline-none"
            >
              <option value="active">Aktif</option>
              <option value="completed">Khatam</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-[#131b2e]">Teks Lafadz Arab *</label>
          <textarea
            required
            rows={3}
            dir="rtl"
            value={arabicText}
            onChange={(e) => setArabicText(e.target.value)}
            className="w-full bg-[#f2f3ff] text-[#003527] font-arabic text-xl px-3 py-2 rounded-xl outline-none text-right focus:bg-white focus:ring-1 focus:ring-[#003527]"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-[#131b2e]">Transliterasi Latin</label>
          <input
            type="text"
            value={latinText}
            onChange={(e) => setLatinText(e.target.value)}
            className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-[#131b2e]">Arti Ringkas</label>
          <textarea
            rows={2}
            value={translationText}
            onChange={(e) => setTranslationText(e.target.value)}
            className="w-full bg-[#f2f3ff] text-[#131b2e] text-xs px-3 py-2 rounded-xl outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </form>
    </div>
  );
}
