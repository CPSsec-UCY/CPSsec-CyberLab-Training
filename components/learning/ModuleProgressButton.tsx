"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useProgress } from "@/components/learning/ProgressProvider";

export function ModuleProgressButton({ slug }: { slug: string }) {
  const { isComplete, toggle } = useProgress();
  const complete = isComplete(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={complete}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
        complete
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25 hover:text-white"
      }`}
    >
      {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {complete ? "Completed" : "Mark complete"}
    </button>
  );
}
