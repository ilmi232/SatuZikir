'use client';

import { useState, useEffect } from 'react';
import { Prayer } from '@/types';
import { DataService } from '@/lib/dataService';
import { Heart, MessageSquarePlus, X, Send, Sparkles } from 'lucide-react';

interface PrayerWallProps {
  campaignId: string;
}

export default function PrayerWall({ campaignId }: PrayerWallProps) {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aminedMap, setAminedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    DataService.getPrayers(campaignId).then((data) => {
      if (isMounted) setPrayers(data);
    });

    const unsubscribe = DataService.subscribeToPrayers(
      campaignId,
      (newPrayer) => {
        setPrayers((prev) => [newPrayer, ...prev.filter((p) => p.id !== newPrayer.id)]);
      },
      (prayerId, newAmin) => {
        setPrayers((prev) =>
          prev.map((p) => (p.id === prayerId ? { ...p, amin_count: newAmin } : p))
        );
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [campaignId]);

  const handleAmin = async (prayerId: string) => {
    if (aminedMap[prayerId]) return;
    setAminedMap((prev) => ({ ...prev, [prayerId]: true }));

    // Optimistic UI
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayerId ? { ...p, amin_count: (p.amin_count || 0) + 1 } : p))
    );

    await DataService.aminPrayer(prayerId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await DataService.submitPrayer(campaignId, name, prayerText);
      setPrayers((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      setName('');
      setPrayerText('');
      setIsModalOpen(false);
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-emerald-950/40 rounded-2xl border border-emerald-900/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-900/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-200">
            Dinding Hajat & Titip Doa Jamaah
          </h3>
          <span className="text-xs text-emerald-400/80 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
            {prayers.length} Doa
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:text-white bg-emerald-800/60 hover:bg-emerald-700/80 rounded-xl border border-emerald-600/50 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-amber-300" />
          <span>Titip Doa</span>
        </button>
      </div>

      {/* List of Prayers */}
      {prayers.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Belum ada hajat yang dititipkan. Jadilah yang pertama menitipkan doa bersama amalan ini.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {prayers.map((prayer) => {
            const hasAmined = Boolean(aminedMap[prayer.id]);
            return (
              <div
                key={prayer.id}
                className="p-3.5 rounded-xl bg-emerald-900/20 border border-emerald-800/40 hover:border-emerald-700/50 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-300 truncate">
                      {prayer.name || 'Hamba Allah'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(prayer.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed break-words">
                    &ldquo;{prayer.prayer_text}&rdquo;
                  </p>
                </div>

                <button
                  onClick={() => handleAmin(prayer.id)}
                  type="button"
                  title="Aamiinkan doa ini"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    hasAmined
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-slate-300 hover:text-amber-200 border border-emerald-800/50'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      hasAmined ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-400'
                    }`}
                  />
                  <span>Aamiin ({prayer.amin_count || 0})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Titip Doa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-emerald-950 border border-emerald-800/70 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-400" />
              <h4 className="text-base font-bold text-slate-100">Titip Hajat & Doa</h4>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tuliskan hajat Anda agar dapat diamini bersama-sama oleh para jamaah yang sedang berzikir.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  Nama Anda (Boleh kosong / Hamba Allah)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Fulan / Hamba Allah (Bandung)"
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  Isi Hajat / Doa *
                </label>
                <textarea
                  required
                  rows={3}
                  value={prayerText}
                  onChange={(e) => setPrayerText(e.target.value)}
                  placeholder="Mohon doakan kesembuhan orang tua, kelancaran rezeki, dll..."
                  className="w-full px-3.5 py-2 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-emerald-900/40 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !prayerText.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Hajat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
