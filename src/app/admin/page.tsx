'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import { DataService } from '@/lib/dataService';
import {
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  RotateCcw,
  LogOut,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCounter, setSelectedForCounter] = useState<Campaign | null>(null);
  const [newCountInput, setNewCountInput] = useState<number>(0);

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

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus campaign "${title}"?`)) {
      await DataService.deleteCampaign(id);
      await loadCampaigns();
    }
  };

  const handleStatusChange = async (campaign: Campaign, newStatus: 'active' | 'completed' | 'draft') => {
    await DataService.saveCampaign({
      ...campaign,
      status: newStatus,
    });
    await loadCampaigns();
  };

  const handleSaveAdjustCounter = async () => {
    if (!selectedForCounter) return;
    await DataService.saveCampaign({
      ...selectedForCounter,
      current_count: Number(newCountInput),
      status: Number(newCountInput) >= selectedForCounter.target_count ? 'completed' : selectedForCounter.status,
    });
    setSelectedForCounter(null);
    await loadCampaigns();
  };

  const totalZikir = campaigns.reduce((acc, c) => acc + Number(c.current_count), 0);
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const completedCount = campaigns.filter((c) => c.status === 'completed').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-amber-400 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Memuat data dashboard admin...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-emerald-900/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white">Dashboard Admin Majelis</h1>
          </div>
          <p className="text-xs text-slate-400">
            Kelola amalan zikir bersama, upload materi lafadz, pantau partisipasi dan sesuaikan target.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Campaign Baru</span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            title="Keluar dari Admin"
            className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-950/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-emerald-800/60 hover:border-rose-700/50 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Total Zikir Terakumulasi</span>
            <span className="text-2xl font-extrabold text-white font-mono">
              {totalZikir.toLocaleString()}x
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Amalan Sedang Berjalan</span>
            <span className="text-2xl font-extrabold text-white font-mono">
              {activeCount} Amalan
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-900/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Khatam / Selesai</span>
            <span className="text-2xl font-extrabold text-white font-mono">
              {completedCount} Amalan
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 sm:p-5 border-b border-emerald-900/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200">Daftar Seluruh Campaign</h2>
          <span className="text-xs text-slate-400 font-medium">{campaigns.length} Total</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-xs text-slate-400 mb-3">Belum ada campaign zikir yang dibuat.</p>
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Campaign Pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-emerald-900/40">
            {campaigns.map((campaign) => {
              const percent = Math.min(
                100,
                Math.round((campaign.current_count / campaign.target_count) * 100)
              );

              return (
                <div
                  key={campaign.id}
                  className="p-4 sm:p-5 hover:bg-emerald-900/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left Column: Image & Title */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-emerald-900/60 overflow-hidden shrink-0 border border-emerald-800/60 flex items-center justify-center">
                      {campaign.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-arabic text-xs text-amber-300/60">Zikir</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-100 truncate">
                          {campaign.title}
                        </h3>

                        {/* Status Switcher Select */}
                        <select
                          value={campaign.status}
                          onChange={(e) =>
                            handleStatusChange(
                              campaign,
                              e.target.value as 'active' | 'completed' | 'draft'
                            )
                          }
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                            campaign.status === 'active'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : campaign.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                          }`}
                        >
                          <option value="active" className="bg-emerald-950 text-slate-100">
                            Aktif
                          </option>
                          <option value="completed" className="bg-emerald-950 text-slate-100">
                            Khatam / Selesai
                          </option>
                          <option value="draft" className="bg-emerald-950 text-slate-100">
                            Draft
                          </option>
                        </select>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                        {campaign.description}
                      </p>

                      {/* Progress Bar Mini */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-32 h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/60">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-amber-300 font-mono">
                          {campaign.current_count.toLocaleString()} /{' '}
                          {campaign.target_count.toLocaleString()} ({percent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {/* View public page */}
                    <Link
                      href={`/campaign/${campaign.slug}`}
                      target="_blank"
                      title="Buka Halaman Publik"
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-slate-300 hover:text-white border border-emerald-800/50 text-xs transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Adjust Counter */}
                    <button
                      onClick={() => {
                        setSelectedForCounter(campaign);
                        setNewCountInput(campaign.current_count);
                      }}
                      type="button"
                      title="Koreksi / Set Angka Hitungan"
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-amber-900/40 text-amber-300 border border-emerald-800/50 text-xs transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/admin/edit/${campaign.id}`}
                      title="Edit Campaign"
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800/50 text-xs transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(campaign.id, campaign.title)}
                      type="button"
                      title="Hapus Campaign"
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-emerald-800/50 text-xs transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Sesuaikan Angka Counter */}
      {selectedForCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-emerald-950 border border-emerald-800/70 rounded-2xl shadow-2xl p-6">
            <h4 className="text-base font-bold text-slate-100 mb-1">Sesuaikan Hitungan</h4>
            <p className="text-xs text-slate-400 mb-4 line-clamp-1">
              {selectedForCounter.title}
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs text-emerald-300 mb-1">
                  Jumlah Hitungan Saat Ini
                </label>
                <input
                  type="number"
                  min={0}
                  value={newCountInput}
                  onChange={(e) => setNewCountInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-sm font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewCountInput(0)}
                  className="flex-1 py-1.5 px-2 bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-800/40 rounded-lg text-xs text-slate-300 transition-colors"
                >
                  Reset ke 0
                </button>
                <button
                  type="button"
                  onClick={() => setNewCountInput(selectedForCounter.target_count)}
                  className="flex-1 py-1.5 px-2 bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-800/40 rounded-lg text-xs text-amber-300 transition-colors"
                >
                  Set Penuh ({selectedForCounter.target_count})
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedForCounter(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-emerald-900/40 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustCounter}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
