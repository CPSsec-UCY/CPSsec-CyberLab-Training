import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="CPSsec CyberLab mark">
      <defs>
        <linearGradient id="logo-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C4DF6" />
          <stop offset="0.58" stopColor="#9B7BFA" />
          <stop offset="1" stopColor="#F26B5B" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5 41.7 13.7v20.6L24 44.5 6.3 34.3V13.7L24 3.5Z"
        fill="#F3F0FF"
        stroke="url(#logo-grad)"
        strokeWidth="1.8"
      />
      <path d="M24 12v24M13.5 18l21 12M34.5 18l-21 12" stroke="url(#logo-grad)" strokeWidth="1.2" opacity="0.55" />
      <circle cx="24" cy="12" r="2.6" fill="#6C4DF6" />
      <circle cx="13.5" cy="18" r="2.3" fill="#9B7BFA" />
      <circle cx="34.5" cy="18" r="2.3" fill="#F26B5B" />
      <circle cx="24" cy="36" r="2.6" fill="#F26B5B" />
      <circle cx="13.5" cy="30" r="2.3" fill="#6C4DF6" />
      <circle cx="34.5" cy="30" r="2.3" fill="#9B7BFA" />
      <circle cx="24" cy="24" r="3.2" fill="#140342" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="CPSsec CyberLab home">
      <LogoMark className="h-10 w-10 transition group-hover:scale-105" />
      <span className="leading-none">
        <span className="block font-sans text-lg font-bold tracking-tight text-navy">CPSsec</span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600">CyberLab</span>
      </span>
    </Link>
  );
}
