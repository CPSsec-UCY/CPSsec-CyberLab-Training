import { getLens } from "@/lib/lenses";
import type { LensLevel } from "@/lib/types";

interface LensProps {
  level: LensLevel;
  title?: string;
  children: React.ReactNode;
}

export function Lens({ level, title, children }: LensProps) {
  const lens = getLens(level);
  const headingId = `lens-${level}-heading`;

  return (
    <section id={`chapter-${level}`} data-lens={level} aria-labelledby={headingId} className="pt-6 scroll-mt-40">
      <div className={`mb-6 flex flex-col gap-3 rounded-2xl border ${lens.accentBorder} ${lens.accentBg} p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${lens.accentBorder} bg-white/80 font-mono text-sm font-bold ${lens.accentText}`}>
            L{level}
          </span>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${lens.accentText}`}>
              {lens.name}
            </p>
            <h2 id={headingId} className="text-base font-bold text-navy">
              {title ?? lens.description}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${lens.dot}`} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
            For {lens.audience}
          </span>
        </div>
      </div>
      <div className="prose prose-cyber max-w-none">{children}</div>
    </section>
  );
}
