'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SatuZikirLogo from '@/components/SatuZikirLogo';
import { isAdminDemoMode, signInAdmin, signInDemoAdmin } from '@/lib/adminAuth';

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#003527]';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInAdmin(email, password);
      router.push('/admin');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    signInDemoAdmin();
    router.push('/admin');
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
            {error}
          </div>
        )}

        {isAdminDemoMode ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#404944] text-center leading-relaxed">
              Supabase belum dikonfigurasi. Mode demo menyimpan data hanya di browser ini.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3.5 bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Masuk Mode Demo
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-bold text-[#131b2e]">Email Admin</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-bold text-[#131b2e]">Kata Sandi</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 mt-1 bg-[#003527] hover:bg-[#064e3b] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {submitting ? 'Memeriksa...' : 'Masuk Hub Admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
