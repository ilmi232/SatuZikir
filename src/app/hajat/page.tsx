'use client';

import React, { useState, useEffect } from 'react';
import { DataService } from '@/lib/dataService';
import { Prayer } from '@/types';

export default function HajatPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [aamiinedIds, setAamiinedIds] = useState<Set<string>>(new Set());
  const [localAamiinCounts, setLocalAamiinCounts] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadPrayers();
    const unsubscribe = DataService.subscribeToPrayers(
      'global',
      (newPrayer) => {
        setPrayers((prev) => [newPrayer, ...prev.filter(p => p.id !== newPrayer.id)]);
      },
      (prayerId, newAmin) => {
        setPrayers((prev) => prev.map(p => p.id === prayerId ? { ...p, amin_count: newAmin } : p));
      }
    );
    return () => unsubscribe();
  }, []);

  const loadPrayers = async () => {
    try {
      const data = await DataService.getPrayers('global');
      setPrayers(data);
    } catch (err) {
      console.error('Failed to load prayers', err);
    }
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setSubmitting(true);
    try {
      await DataService.submitPrayer('global', name, text);
      setName('');
      setText('');
      showNotification('Hajat berhasil dititipkan 🤲');
      loadPrayers();
    } catch (err) {
      console.error(err);
      showNotification('Gagal mengirim hajat.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAamiin = async (prayerId: string) => {
    if (aamiinedIds.has(prayerId)) return;
    
    setAamiinedIds((prev) => new Set(prev).add(prayerId));
    setLocalAamiinCounts((prev) => ({
      ...prev,
      [prayerId]: (prev[prayerId] || prayers.find(p => p.id === prayerId)?.amin_count || 0) + 1
    }));
    
    const btn = document.getElementById(`aamiin-btn-${prayerId}`);
    if (btn) {
      btn.classList.add('scale-95');
      setTimeout(() => btn.classList.remove('scale-95'), 150);
    }

    try {
      await DataService.aminPrayer(prayerId);
      showNotification('Aamiin Ya Rabbalalamin 🤲');
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${Math.floor(diffHours / 24)} hari lalu`;
  };

  return (
    <div className="flex flex-col w-full px-4 gap-4 pt-1 pb-4">
      {/* Section 1: Hero Card */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#003527] to-[#002117] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#31c98f]/10 blur-xl pointer-events-none" />
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-[#ffdcc3]">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline text-2xl font-bold leading-tight">Dinding Doa Jamaah</h1>
            <span className="text-[11px] text-[#95d3ba] font-semibold uppercase tracking-wider">
              Munajat Bersama Se-Nusantara
            </span>
          </div>
        </div>
        <p className="text-xs text-[#b0f0d6]/90 mt-1 leading-relaxed">
          Kirimkan hajat dan munajatmu. Ribuan saudara seiman akan mengaminkan doamu dalam majelis zikir ini.
        </p>
        <div className="inline-flex items-center gap-2 bg-[#002117]/60 border border-[#064e3b]/50 rounded-full px-3 py-1 text-xs font-medium mt-3 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-[#31c98f] animate-ping" />
          <span className="text-xs text-[#ffdcc3] font-bold font-mono">{prayers.length}</span>
          <span className="text-xs text-[#95d3ba]">doa aktif menunggu aamiin</span>
        </div>
      </div>

      {/* Section 2: Form Kirim Hajat */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#eaedff] p-4.5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-headline text-lg font-bold text-[#003527]">
            <span className="material-symbols-outlined text-[#904d00] text-[20px]">edit_note</span>
            <span>Titipkan Hajatmu</span>
          </h2>
          <span className="text-[11px] text-[#404944] bg-[#f2f3ff] px-2.5 py-0.5 rounded-full font-medium">
            Tanpa Login
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama / Inisial / Kota (opsional)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#003527]"
            disabled={submitting}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tuliskan hajat kesembuhan, kelancaran rezeki, atau doa terbaik..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#003527] resize-none h-24"
            disabled={submitting}
            required
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="w-full h-11 bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all flex justify-center items-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>{submitting ? 'Mengirimkan...' : 'Titipkan Doa ke Majelis 🤲'}</span>
          </button>
        </form>
      </div>

      {/* Section 3: Dinding Doa */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg text-[#003527] font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#904d00] text-[18px]">volunteer_activism</span>
            <span>Daftar Hajat Jamaah</span>
          </h2>
          <span className="text-xs text-[#404944] font-medium">{prayers.length} Terkumpul</span>
        </div>
        
        {prayers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-[#eaedff] flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] flex items-center justify-center text-[#404944]">
              <span className="material-symbols-outlined text-[28px]">volunteer_activism</span>
            </div>
            <p className="text-xs text-[#404944]">
              Belum ada doa tertulis hari ini.<br />Jadilah yang pertama menitipkan hajat di majelis.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {prayers.map((prayer) => {
              const isCampaign = prayer.campaign_id && prayer.campaign_id !== 'global';
              const displayAmin = localAamiinCounts[prayer.id] || prayer.amin_count || 0;
              const hasAamiined = aamiinedIds.has(prayer.id);

              return (
                <div
                  key={prayer.id}
                  className="bg-white rounded-2xl shadow-sm p-4 border border-[#eaedff] flex flex-col gap-2 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-[10px] font-bold">
                        {(prayer.name || 'HA').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-[#131b2e]">{prayer.name || 'Hamba Allah'}</span>
                    </div>
                    <span className="text-[10px] text-[#404944]">{formatRelativeTime(prayer.created_at)}</span>
                  </div>

                  <p className="text-xs text-[#131b2e] leading-relaxed italic bg-[#faf8ff] p-3 rounded-xl border border-[#eaedff]/60">
                    &ldquo;{prayer.prayer_text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    {isCampaign ? (
                      <span className="bg-[#b0f0d6]/50 text-[#003527] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Majelis Zikir
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#404944]">Hajat Umum</span>
                    )}
                    
                    <button
                      id={`aamiin-btn-${prayer.id}`}
                      onClick={() => handleAamiin(prayer.id)}
                      disabled={hasAamiined}
                      type="button"
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer
                        ${hasAamiined 
                          ? 'bg-[#004f34] text-[#31c98f]' 
                          : 'bg-[#ffdcc3] hover:bg-[#ffb77d] text-[#663500] active:scale-95 shadow-sm'
                        }`}
                    >
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        favorite
                      </span>
                      <span>Aamiin ({displayAmin})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#283044] text-white px-5 py-2.5 rounded-xl shadow-xl z-50 text-xs font-semibold whitespace-nowrap animate-in fade-in slide-in-from-bottom duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
