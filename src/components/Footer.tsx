import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-950/80 bg-emerald-950/60 backdrop-blur-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-200">SatuZikir</span>
              <span className="text-xs text-emerald-400/70">• Majelis Zikir Daring</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              &quot;Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.&quot; (QS. Ar-Ra&apos;d: 28). Bebas berzikir bersama tanpa registrasi.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-center gap-1">
              <span>Dibangun dengan</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>untuk kebaikan bersama</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="hover:text-emerald-300 transition-colors">
                Kelola Campaign (Admin)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
