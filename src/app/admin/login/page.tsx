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
      setError('PIN Admin salah. Silakan coba lagi.');
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
            {error}
          </div>
        )}

        <form onSubmit={handlePinLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#131b2e]">PIN Akses Admin</label>
            <div className="flex flex-col gap-1">
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN Admin"
                className="w-full px-4 py-3 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-center tracking-widest font-mono text-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003527]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Masuk Hub Admin
          </button>
        </form>
      </div>
    </div>
  );
}
