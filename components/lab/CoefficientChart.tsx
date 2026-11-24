"use client";

import type { BufferId } from "@/lib/wasm/pqcLab";

export function CoefficientChart({
  values,
  label,
  id,
  accent,
  q,
}: {
  values: number[];
  label: string;
  id: BufferId;
  accent: string;
  q: number;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/50 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">{id}</span>
      </div>
      <svg viewBox="0 0 512 84" className="mt-2 h-24 w-full" role="img" aria-label={`${label} coefficient plot`}>
        <line x1="0" y1="74" x2="512" y2="74" stroke="rgba(148,163,184,0.25)" />
        {values.map((value, index) => {
          const height = (value / Math.max(max, q)) * 66;
          return (
            <rect
              key={index}
              x={index * 4}
              y={74 - height}
              width="3"
              height={height}
              rx="0.5"
              className={accent}
            />
          );
        })}
      </svg>
      <div className="flex justify-between font-mono text-[9px] text-slate-600">
        <span>0</span>
        <span>63</span>
        <span>127</span>
      </div>
    </div>
  );
}
