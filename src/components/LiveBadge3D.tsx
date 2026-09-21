export default function LiveBadge3D({ className = 'h-7' }: { className?: string }) {
  return (
    <div className="relative inline-flex items-center select-none shrink-0" title="Majelis Sedang Live">
      {/* Subtle pulsing emerald aura */}
      <span className="absolute inset-0 rounded-full bg-emerald-400/20 blur-sm animate-pulse pointer-events-none" />
      <img
        src="/live-badge-3d.png"
        alt="Majelis Live"
        className={`${className} w-auto object-contain relative drop-shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition-transform duration-200 hover:scale-105`}
      />
    </div>
  );
}
