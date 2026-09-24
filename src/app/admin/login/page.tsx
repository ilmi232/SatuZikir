'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SatuZikirLogo from '@/components/SatuZikirLogo';
import { signInAdmin } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Waktu (ms epoch) sampai login boleh dicoba lagi setelah terlalu banyak salah PIN
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState<number>(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) {
        setLockedUntil(null);
        setError('');
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [lockedUntil]);

  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil || pin.length !== 6) return;
    setError('');
    setSubmitting(true);
    try {
      await signInAdmin(pin);
      router.push('/admin');
    } catch (err) {
      setPin('');
      setError((err as Error).message);
      const retry = (err as Error & { retryAfterSec?: number }).retryAfterSec;
      if (retry) {
        setNow(Date.now());
        setLockedUntil(Date.now() + retry * 1000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh]">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-[#eaedff]">
        <div className="flex flex-col items-center mb-8">
          <SatuZikirLogo className="w-16 h-16 mb-4" />
          <h1 className="font-headline text-2xl text-[#003527] font-bold">Admin SatuZikir</h1>
          <p className="text-xs text-[#404944] mt-1 text-center">
            Pusat kendali amalan zikir bersama jamaah
          </p>
        </div>

        {error && (
          <div className="bg-[#ffe4e4] text-[#a00000] text-xs font-semibold p-3 rounded-xl mb-6 text-center animate-in fade-in duration-200">
            {lockedUntil
              ? `Terlalu banyak percobaan PIN salah. Coba lagi dalam ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}.`
              : error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-pin" className="text-xs font-bold text-[#131b2e]">PIN Akses Admin</label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              pattern="\d{6}"
              maxLength={6}
              required
              disabled={Boolean(lockedUntil)}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-center tracking-[0.5em] font-mono text-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003527] disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || Boolean(lockedUntil) || pin.length !== 6}
            className="w-full py-3.5 bg-[#003527] hover:bg-[#064e3b] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {submitting ? 'Memeriksa...' : 'Masuk Hub Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
