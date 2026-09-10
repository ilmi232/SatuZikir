'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ArrowLeft, Save, Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [targetCount, setTargetCount] = useState<number>(4444);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [arabicText, setArabicText] = useState('');
  const [latinText, setLatinText] = useState('');
  const [translationText, setTranslationText] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'draft'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        setTargetCount(found.target_count);
        setCurrentCount(found.current_count);
        setArabicText(found.arabic_text);
        setLatinText(found.latin_text || '');
        setTranslationText(found.translation_text || '');
        setDescription(found.description || '');
        setImageUrl(found.image_url || '');
        setStatus(found.status);
      }
      setLoading(false);
    });
  }, [id, router]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `posters/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campaign-images')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('campaign-images')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            setImageUrl(publicUrlData.publicUrl);
            setUploadingImage(false);
            return;
          }
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign || !title.trim() || !arabicText.trim() || !targetCount) return;

    setIsSubmitting(true);
    try {
      await DataService.saveCampaign({
        id: campaign.id,
        title: title.trim(),
        slug: slug.trim() || campaign.slug,
        description: description.trim(),
        arabic_text: arabicText.trim(),
        latin_text: latinText.trim(),
        translation_text: translationText.trim(),
        target_count: Number(targetCount),
        current_count: Number(currentCount) || 0,
        image_url: imageUrl.trim() || undefined,
        status,
      });

      router.push('/admin');
    } catch {
      alert('Terjadi kesalahan saat menyimpan perubahan campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-amber-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Memuat data campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-xs text-slate-400 mb-4">Campaign tidak ditemukan.</p>
        <Link
          href="/admin"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-emerald-900/60">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-slate-300 hover:text-white border border-emerald-900/60 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </Link>

        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Edit Campaign: {campaign.title}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 backdrop-blur-sm space-y-4">
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
            1. Informasi Dasar
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Judul Campaign Amalan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Slug URL (Alamat Web) *
              </label>
              <div className="flex items-center rounded-xl bg-emerald-900/40 border border-emerald-800/60 px-3 py-2 text-xs text-slate-400 font-mono">
                <span className="text-slate-500 mr-1">/campaign/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-amber-300 focus:outline-none flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Target Hitungan (Angka Zikir) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Deskripsi Singkat / Keutamaan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 backdrop-blur-sm space-y-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            2. Lafadz & Teks Zikir
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Teks Arab (Berharakat Jelas) *
            </label>
            <textarea
              required
              rows={3}
              dir="rtl"
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-amber-200 font-arabic text-xl leading-relaxed focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Transliterasi Latin
            </label>
            <input
              type="text"
              value={latinText}
              onChange={(e) => setLatinText(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400 italic"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Terjemahan Bahasa Indonesia
            </label>
            <textarea
              rows={2}
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 backdrop-blur-sm space-y-4">
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
            3. Poster & Pengaturan Status
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Upload Foto / Poster Amalan
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>{uploadingImage ? 'Mengunggah...' : 'Ganti File Gambar'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="mt-3 relative w-36 h-24 rounded-xl overflow-hidden border border-emerald-700/60 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 bg-slate-950/70 text-slate-300 hover:text-white text-[10px] px-1.5 py-0.5 rounded"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Hitungan Saat Ini
              </label>
              <input
                type="number"
                min={0}
                value={currentCount}
                onChange={(e) => setCurrentCount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Status Publikasi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'draft')}
                className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="active">Aktif (Sedang Berjalan)</option>
                <option value="completed">Khatam / Selesai</option>
                <option value="draft">Draft (Disembunyikan)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
