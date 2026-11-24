"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Atom,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  KeyRound,
  Network,
  Share2,
  ShieldCheck,
} from "lucide-react";
import type { ModuleMeta } from "@/lib/types";
import { DIFFICULTY_STYLES, getTrack } from "@/lib/tracks";
import { LensDots } from "@/components/modules/LensDots";
import { useProgress } from "@/components/learning/ProgressProvider";

const ICONS = {
  shield: ShieldCheck,
  atom: Atom,
  network: Network,
  share: Share2,
  activity: Activity,
  cpu: Cpu,
  key: KeyRound,
};

export function ModuleCard({ module }: { module: ModuleMeta }) {
  const track = getTrack(module.track);
  const Icon = ICONS[track.icon];
  const { isComplete } = useProgress();
  const complete = isComplete(module.slug);

  return (
    <Link
      href={`/learn/${module.slug}/`}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-float ${
        complete ? "border-emerald-200" : "border-line hover:border-brand-200"
      }`}
    >
      <div className={`relative h-36 bg-gradient-to-br ${track.cover} p-4`}>
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(20,3,66,0.12)_1px,transparent_0)] [background-size:18px_18px]" />
        <div className="relative flex items-start justify-between">
          <span className={`rounded-full border bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] backdrop-blur ${track.border} ${track.text}`}>
            {track.short}
          </span>
          <span className={`rounded-full border bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] backdrop-blur ${DIFFICULTY_STYLES[module.difficulty]}`}>
            {module.difficulty}
          </span>
        </div>
        <span className="relative mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-brand-700 shadow-card">
          <Icon className="h-7 w-7" />
        </span>
        {complete ? (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white">
            <CheckCircle2 className="h-3 w-3" /> done
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Course {String(module.order).padStart(2, "0")}
          </span>
          <ArrowUpRight className="h-4 w-4 text-brand-300 transition group-hover:text-brand-600" />
        </div>
        <h3 className="mt-2 text-[17px] font-bold leading-snug text-navy transition group-hover:text-brand-700">
          {module.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-body">{module.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {module.readingTime} min</span>
          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {module.citations.length} sources</span>
          <span className="ml-auto"><LensDots lenses={module.lenses} showLabels /></span>
        </div>
      </div>
    </Link>
  );
}
