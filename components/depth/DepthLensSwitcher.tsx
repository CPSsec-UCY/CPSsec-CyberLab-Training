"use client";

import { BookOpen, Layers } from "lucide-react";
import { LENSES } from "@/lib/lenses";
import { useDepthLens } from "@/components/depth/DepthLensProvider";

export function DepthLensSwitcher() {
  const { lens, mode, setLens, showGuide } = useDepthLens();
  const current = LENSES.find((item) => item.level === lens) ?? LENSES[0];

  return (
    <div className="sticky top-[78px] z-30 -mx-5 border-b border-line bg-white px-5 py-3 sm:-mx-8 sm:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            {mode === "guide" ? <BookOpen className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              {mode === "guide" ? "Full course guide" : "Focused depth lens"}
            </p>
            <p className="text-[11px] text-muted">Four chapters · choose one lens or read them all</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0" role="group" aria-label="Course reading mode">
          <button
            type="button"
            aria-pressed={mode === "guide"}
            onClick={showGuide}
            className={`flex min-w-[116px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
              mode === "guide"
                ? "border-brand-300 bg-brand-50 text-brand-700 shadow-sm"
                : "border-line bg-white text-body hover:border-brand-200 hover:bg-brand-50/50"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold">Full guide</span>
              <span className="text-[9px] text-muted">all four chapters</span>
            </span>
          </button>
          {LENSES.map((item) => {
            const active = mode === "lens" && item.level === lens;
            return (
              <button
                key={item.level}
                type="button"
                aria-pressed={active}
                onClick={() => setLens(item.level)}
                className={`flex min-w-[118px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
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
        {mode === "guide" ? (
          <span className="font-semibold text-brand-700">Full guide</span>
        ) : (
          <span className={`font-semibold ${current.accentText}`}>L{lens} · {current.name}</span>
        )}
        {" — "}
        {mode === "guide"
          ? "Read intuition, mechanics, formal correctness and implementation in sequence."
          : current.description}
      </p>
    </div>
  );
}
