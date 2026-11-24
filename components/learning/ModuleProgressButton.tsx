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
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
        complete
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-line bg-white text-body hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {complete ? "Completed" : "Mark complete"}
    </button>
  );
}
