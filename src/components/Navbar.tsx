'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-emerald-950/80 border-b border-emerald-900/60 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-emerald-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-100 via-emerald-200 to-amber-300 bg-clip-text text-transparent">
              SatuZikir
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-emerald-400/80 ml-2 tracking-widest px-1.5 py-0.5 bg-emerald-900/40 rounded border border-emerald-800/50">
              Real-time
            </span>
          </div>
        </Link>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/#campaigns"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-900/40 hover:bg-emerald-800/50 rounded-full border border-emerald-700/40 transition-colors"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            Daftar Amalan
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-300 hover:text-amber-300 bg-emerald-950/60 hover:bg-emerald-900/60 rounded-full border border-emerald-800/60 transition-all hover:border-amber-500/40"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
