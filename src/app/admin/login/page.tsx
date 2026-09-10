'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useEmailAuth, setUseEmailAuth] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expectedPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '123456';

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin === expectedPin) {
      sessionStorage.setItem('satuzikir_admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('PIN Admin salah. Default PIN demo adalah 123456.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase belum dikonfigurasi. Silakan gunakan PIN demo: 123456.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || 'Login gagal. Periksa email & password.');
    } else {
      sessionStorage.setItem('satuzikir_admin_auth', 'true');
      router.push('/admin');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-emerald-950/80 border border-emerald-800/70 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin SatuZikir</h1>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk mengelola amalan, target zikir, dan poster
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!useEmailAuth ? (
          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                PIN Akses Admin
              </label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN Admin (Demo: 123456)"
                className="w-full px-4 py-3 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors text-center tracking-widest font-mono text-lg"
              />
              <span className="block text-[11px] text-slate-400 mt-1.5 text-center">
                PIN default demo: <code className="text-amber-300">123456</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              Masuk Dashboard Admin
            </button>

            {isSupabaseConfigured && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setUseEmailAuth(true)}
                  className="text-xs text-emerald-400 hover:text-amber-300 transition-colors"
                >
                  Atau masuk dengan Email & Password Supabase
                </button>
              </div>
            )}
          </form>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1">
                Email Admin
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@satuzikir.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-900/40 border border-emerald-800/60 text-slate-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Memverifikasi...' : 'Masuk dengan Supabase'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setUseEmailAuth(false)}
                className="text-xs text-emerald-400 hover:text-amber-300 transition-colors"
              >
                Kembali ke Login PIN Cepat
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-emerald-900/60 text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            SatuZikir Manajemen Majelis
          </span>
        </div>
      </div>
    </div>
  );
}
