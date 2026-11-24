"use client";

import { useProgress } from "@/components/learning/ProgressProvider";

export function ProgressSummary({ total }: { total: number }) {
  const { totalCompleted } = useProgress();
  const clamped = Math.min(totalCompleted, total);
  const percent = total > 0 ? Math.round((clamped / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-ink-850/50 p-4">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className="text-slate-400">Your local progress</span>
        <span className="text-cyber-cyan">{clamped}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full bg-gradient-to-r from-cyber-cyan to-cyber-violet transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-[11px] leading-5 text-slate-500">
        Stored only in this browser. Nothing is sent to a server.
      </p>
    </div>
  );
}
