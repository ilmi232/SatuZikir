import Link from 'next/link';
import { Campaign } from '@/types';
import { Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.min(100, Math.round((campaign.current_count / campaign.target_count) * 100));
  const isCompleted = campaign.status === 'completed' || campaign.current_count >= campaign.target_count;
  const remaining = Math.max(0, campaign.target_count - campaign.current_count);

  return (
    <div className="group relative rounded-2xl bg-emerald-950/40 border border-emerald-900/60 hover:border-amber-500/40 transition-all duration-300 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-emerald-950/60">
      {/* Top Banner Image or Gradient */}
      <div className="relative h-44 w-full bg-emerald-900/40 overflow-hidden">
        {campaign.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.image_url}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 flex items-center justify-center p-6 text-center">
            <span className="font-arabic text-2xl text-amber-200/40 line-clamp-2">
              {campaign.arabic_text}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-slate-950 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Khatam Target
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-slate-950 shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-950 inline-block" />
              Sedang Berjalan
            </span>
          )}
        </div>

        {/* Target Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Target: {campaign.target_count.toLocaleString()}x
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-2">
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-300/80 line-clamp-2 mb-4 leading-relaxed">
            {campaign.description}
          </p>

          {/* Arabic Snippet */}
          <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-800/40 mb-4 text-center">
            <p className="font-arabic text-base text-amber-100 line-clamp-1">
              {campaign.arabic_text}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="pt-2 border-t border-emerald-900/40">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Terkumpul:
            </span>
            <span className="text-amber-400 font-bold">
              {campaign.current_count.toLocaleString()}{' '}
              <span className="text-slate-400 font-normal text-[11px]">
                ({percentage}%)
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/60 p-0.5 mb-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
                  : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-300'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
            <span>
              {isCompleted ? 'Target terpenuhi sempurna' : `Sisa ${remaining.toLocaleString()}x lagi`}
            </span>
            <span>{campaign.target_count.toLocaleString()} Total</span>
          </div>

          {/* Action Button */}
          <Link
            href={`/campaign/${campaign.slug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all bg-emerald-800/80 hover:bg-emerald-600 text-white shadow-md group-hover:shadow-emerald-900/60"
          >
            <span>{isCompleted ? 'Lihat Amalan & Ikut Menambah' : 'Ikut Berzikir Sekarang'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
