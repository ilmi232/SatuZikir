'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SatuZikirLogo from '@/components/SatuZikirLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[60vh]">
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-[#eaedff] text-center space-y-4">
        <div className="w-16 h-16 mx-auto flex items-center justify-center">
          <SatuZikirLogo className="w-16 h-16" />
        </div>

        <div>
          <h1 className="font-headline text-2xl text-[#003527] font-bold">Admin SatuZikir</h1>
          <p className="text-xs text-[#404944] mt-1">
            Pusat kendali amalan zikir bersama jamaah
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handlePinLogin} className="space-y-4 pt-2">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-[#131b2e]">PIN Akses Admin</label>
            <input
              type="password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Masukkan PIN Admin (Demo: 123456)"
              className="w-full px-4 py-3 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-center tracking-widest font-mono text-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003527]"
            />
            <span className="text-[11px] text-[#404944] text-center mt-1">
              PIN default: <code className="text-[#904d00] font-bold">123456</code>
            </span>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            Masuk Hub Admin
          </button>
        </form>
      </div>
    </div>
  );
}
