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
        <linearGradient id="emeraldBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="30%" stopColor="#FBBF24" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
        <radialGradient id="beadGlow" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Glossy App Icon Base */}
      <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#emeraldBase)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <path d="M 2 30 Q 50 45 98 30 L 98 24 Q 98 2 76 2 L 24 2 Q 2 2 2 24 Z" fill="rgba(255,255,255,0.08)" />

      {/* 8-pointed gold star outline (Rub el Hizb) */}
      <g stroke="url(#goldGradient)" strokeWidth="2.5" fill="none" filter="url(#shadow)">
        <rect x="25" y="25" width="50" height="50" rx="2" />
        <rect x="25" y="25" width="50" height="50" rx="2" transform="rotate(45 50 50)" />
      </g>

      {/* Crescent Moon */}
      <path d="M 46 29 A 9.5 9.5 0 1 0 57 41 A 12 12 0 1 1 46 29 Z" fill="url(#goldGradient)" filter="url(#shadow)" />
      
      {/* 4-pointed Star next to Crescent */}
      <path d="M59 31 L60 34 L63 35 L60 36 L59 39 L58 36 L55 35 L58 34 Z" fill="url(#goldGradient)" filter="url(#shadow)" />

      {/* Glowing Tasbih Beads (U-Shape) */}
      <g filter="url(#shadow)">
        <circle cx="31" cy="46" r="3.5" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="35" cy="54" r="4" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="41.5" cy="61" r="4.5" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="50" cy="65" r="5.5" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="58.5" cy="61" r="4.5" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="65" cy="54" r="4" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
        <circle cx="69" cy="46" r="3.5" fill="url(#beadGlow)" stroke="#A7F3D0" strokeWidth="0.5" />
      </g>

      {/* Gold Tassel at bottom */}
      <g filter="url(#shadow)">
        <path d="M47 74 L53 74 L56 86 L52 86 L50 83 L48 86 L44 86 Z" fill="url(#goldGradient)" />
        <circle cx="50" cy="73" r="2.5" fill="url(#goldGradient)" />
      </g>
    </svg>
  );
}
