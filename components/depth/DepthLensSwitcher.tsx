"use client";

import { Layers } from "lucide-react";
import { LENSES } from "@/lib/lenses";
import { useDepthLens } from "@/components/depth/DepthLensProvider";

export function DepthLensSwitcher() {
  const { lens, setLens } = useDepthLens();
  const current = LENSES.find((item) => item.level === lens) ?? LENSES[0];

  return (
    <div className="sticky top-[78px] z-30 -mx-5 border-b border-line bg-white px-5 py-3 sm:-mx-8 sm:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Layers className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Depth lens</p>
            <p className="text-[11px] text-muted">One course · four abstraction layers</p>
          </div>
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
                className={`flex min-w-[126px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                  active
                    ? `${item.accentBorder} ${item.accentBg} ${item.accentText} shadow-sm`
                    : "border-line bg-white text-body hover:border-brand-200 hover:bg-brand-50/50"
                }`}
                title={item.description}
              >
                <span className={`text-[10px] font-bold ${active ? item.accentText : "text-muted"}`}>L{item.level}</span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] font-semibold">{item.short}</span>
                  <span className="text-[9px] text-muted">{item.audience.split(",")[0]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-[11px] text-muted xl:mt-1">
        <span className={`font-semibold ${current.accentText}`}>L{lens} · {current.name}</span> — {current.description}
      </p>
    </div>
  );
}
