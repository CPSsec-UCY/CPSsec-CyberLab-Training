import { LENSES } from "@/lib/lenses";
import type { LensLevel } from "@/lib/types";

export function LensDots({ lenses, showLabels = false }: { lenses: LensLevel[]; showLabels?: boolean }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Covers depth lenses ${lenses.join(", ")}`}>
      {LENSES.map((lens) => {
        const active = lenses.includes(lens.level);
        return (
          <span key={lens.level} className="flex items-center gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${active ? lens.dot : "bg-slate-700"}`}
              title={`L${lens.level} · ${lens.name}`}
            />
            {showLabels ? (
              <span className={`font-mono text-[9px] uppercase tracking-[0.1em] ${active ? "text-slate-400" : "text-slate-700"}`}>
                L{lens.level}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
