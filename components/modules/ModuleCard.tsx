"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import type { ModuleMeta } from "@/lib/types";
import { DIFFICULTY_STYLES, getTrack } from "@/lib/tracks";
import { LensDots } from "@/components/modules/LensDots";
import { useProgress } from "@/components/learning/ProgressProvider";

export function ModuleCard({ module }: { module: ModuleMeta }) {
  const track = getTrack(module.track);
  const { isComplete } = useProgress();
  const complete = isComplete(module.slug);

  return (
    <Link
      href={`/learn/${module.slug}/`}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-ink-850/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-ink-800/80 ${
        complete ? "border-emerald-400/30" : "border-white/10 hover:border-white/25"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-px ${track.dot} opacity-60`} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            {String(module.order).padStart(2, "0")}
          </span>
          <span className={`chip ${track.border} ${track.text}`}>{track.short}</span>
        </div>
        {complete ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-label="Completed" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-cyber-cyan" />
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-white group-hover:text-cyber-cyan">
        {module.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{module.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-3">
        <LensDots lenses={module.lenses} showLabels />
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${DIFFICULTY_STYLES[module.difficulty]}`}>
          {module.difficulty}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">
          <Clock className="h-3 w-3" /> {module.readingTime} min
        </span>
      </div>
    </Link>
  );
}
