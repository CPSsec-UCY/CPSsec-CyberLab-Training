import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="CPSsec CyberLab mark">
      <defs>
        <linearGradient id="logo-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5 41.7 13.7v20.6L24 44.5 6.3 34.3V13.7L24 3.5Z"
        fill="rgba(34,211,238,0.06)"
        stroke="url(#logo-grad)"
        strokeWidth="1.6"
      />
      <path d="M24 12v24M13.5 18l21 12M34.5 18l-21 12" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.65" />
      <circle cx="24" cy="12" r="2.6" fill="#22d3ee" />
      <circle cx="13.5" cy="18" r="2.3" fill="#2dd4bf" />
      <circle cx="34.5" cy="18" r="2.3" fill="#a78bfa" />
      <circle cx="24" cy="36" r="2.6" fill="#a78bfa" />
      <circle cx="13.5" cy="30" r="2.3" fill="#22d3ee" />
      <circle cx="34.5" cy="30" r="2.3" fill="#2dd4bf" />
      <circle cx="24" cy="24" r="3.2" fill="#e2e8f0" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="CPSsec CyberLab home">
      <LogoMark className="h-9 w-9 transition group-hover:scale-105" />
      <span className="leading-none">
        <span className="block font-mono text-sm font-semibold tracking-[0.16em] text-white">CPSsec</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-cyber-cyan">CyberLab</span>
      </span>
    </Link>
  );
}
