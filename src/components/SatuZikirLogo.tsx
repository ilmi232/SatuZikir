export default function SatuZikirLogo({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-label="SatuZikir Emblem Logo"
    >
      <defs>
        <linearGradient id="emeraldGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="goldGlow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
        <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background Glass Circle */}
      <circle cx="50" cy="50" r="48" fill="url(#emeraldGlass)" filter="url(#glassBlur)" />
      
      {/* Outer Glow Ring */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#goldGlow)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Rub el Hizb (8-pointed star) with Gold Gradient */}
      <g stroke="url(#goldGlow)" strokeWidth="2.5" fill="none" filter="url(#glassBlur)">
        <rect x="25" y="25" width="50" height="50" rx="4" />
        <rect x="25" y="25" width="50" height="50" rx="4" transform="rotate(45 50 50)" />
      </g>

      {/* Inner Emerald Jewel */}
      <circle cx="50" cy="50" r="16" fill="#047857" stroke="url(#goldGlow)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="10" fill="#34D399" opacity="0.4" />
      
      {/* Central Spark / Divine Bead */}
      <path d="M50 42 L52 48 L58 50 L52 52 L50 58 L48 52 L42 50 L48 48 Z" fill="#FEF3C7" />
    </svg>
  );
}
