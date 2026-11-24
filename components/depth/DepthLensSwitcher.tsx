"use client";

import { Layers } from "lucide-react";
import { LENSES } from "@/lib/lenses";
import { useDepthLens } from "@/components/depth/DepthLensProvider";

export function DepthLensSwitcher() {
  const { lens, setLens } = useDepthLens();
  const current = LENSES.find((item) => item.level === lens) ?? LENSES[0];

  return (
    <div className="sticky top-16 z-30 -mx-5 border-y border-white/10 bg-ink-950/95 px-5 py-3 sm:-mx-8 sm:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyber-cyan" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Depth lens</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600 sm:inline">
            same concept · four abstraction layers
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0" role="group" aria-label="Choose depth lens">
          {LENSES.map((item) => {
            const active = item.level === lens;
            return (
              <button
                key={item.level}
                type="button"
                aria-pressed={active}
                onClick={() => setLens(item.level)}
                className={`group flex min-w-[132px] shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? `${item.accentBorder} ${item.accentBg} ${item.accentText}`
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white"
                }`}
                title={item.description}
              >
                <span className={`font-mono text-[10px] ${active ? item.accentText : "text-slate-600"}`}>
                  L{item.level}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] font-medium">{item.short}</span>
                  <span className="text-[9px] uppercase tracking-[0.12em] opacity-60">{item.audience.split(",")[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 line-clamp-1 font-mono text-[10px] text-slate-500 xl:mt-1">
        <span className={current.accentText}>L{lens} · {current.name}</span> — {current.description}
      </p>
    </div>
  );
}
