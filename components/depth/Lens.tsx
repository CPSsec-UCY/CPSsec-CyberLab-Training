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
    <section data-lens={level} aria-labelledby={headingId} className="pt-6">
      <div className={`mb-6 flex flex-col gap-2 rounded-xl border ${lens.accentBorder} ${lens.accentBg} p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${lens.accentBorder} bg-ink-950/40 font-mono text-sm ${lens.accentText}`}>
            L{level}
          </span>
          <div>
            <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${lens.accentText}`}>
              {lens.name}
            </p>
            <h2 id={headingId} className="text-base font-semibold text-white">
              {title ?? lens.description}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${lens.dot}`} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
            For {lens.audience}
          </span>
        </div>
      </div>
      <div className="prose prose-cyber max-w-none">{children}</div>
    </section>
  );
}
