"use client";

import { useProgress } from "@/components/learning/ProgressProvider";

export function ProgressSummary({ total }: { total: number }) {
  const { totalCompleted } = useProgress();
  const clamped = Math.min(totalCompleted, total);
  const percent = total > 0 ? Math.round((clamped / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em]">
        <span className="text-muted">Your progress</span>
        <span className="text-brand-700">{clamped}/{total}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist-200">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-400 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-[11px] leading-5 text-muted">
        Stored only in this browser. Nothing is sent to a server.
      </p>
    </div>
  );
}
