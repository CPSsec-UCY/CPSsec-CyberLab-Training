import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText, Layers } from "lucide-react";
import type { ModuleMeta } from "@/lib/types";
import { DIFFICULTY_STYLES, getTrack } from "@/lib/tracks";
import { LensDots } from "@/components/modules/LensDots";
import { ModuleProgressButton } from "@/components/learning/ModuleProgressButton";
import { formatDate } from "@/lib/format";

export function ModuleHeader({ module, citationCount }: { module: ModuleMeta; citationCount: number }) {
  const track = getTrack(module.track);

  return (
    <header className="relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-brand-50/40 to-ink-950">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-coral-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="container-page relative py-8 sm:py-12">
        <Link
          href="/curriculum/"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted hover:text-brand-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Course catalogue
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${track.border} ${track.accent} ${track.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${track.dot}`} /> {module.track}
              </span>
              <span className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${DIFFICULTY_STYLES[module.difficulty]}`}>
                {module.difficulty}
              </span>
              <span className="chip">Course {String(module.order).padStart(2, "0")}</span>
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-navy sm:text-5xl">
              {module.title}
            </h1>
            {module.subtitle ? <p className="mt-3 max-w-3xl text-lg leading-7 text-body">{module.subtitle}</p> : null}
            <p className="mt-4 max-w-3xl leading-7 text-body">{module.summary}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-500" /> {module.readingTime} min</span>
              <span className="inline-flex items-center gap-1.5"><FileText className="h-4 w-4 text-brand-500" /> {citationCount} sources</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-brand-500" /> Updated {formatDate(module.updated)}</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-brand-500" /> 4 depth lenses</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {module.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ModuleProgressButton slug={module.slug} />
              <span className="text-[11px] text-muted">Progress is stored only in this browser.</span>
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-700">Course at a glance</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Track</dt>
                <dd className={`text-right font-semibold ${track.text}`}>{track.short}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Level</dt>
                <dd className="font-semibold text-navy">{module.difficulty}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Reading</dt>
                <dd className="font-semibold text-navy">{module.readingTime} min</dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <dt className="text-muted">Sources</dt>
                <dd className="font-semibold text-navy">{citationCount} cited</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Depth lenses</dt>
                <dd><LensDots lenses={module.lenses} showLabels /></dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-mist-100 p-3 text-[11px] leading-5 text-muted">
              Switch between L1 intuition, L2 mechanics, L3 formal correctness and L4 hardware reality at any point.
            </p>
          </aside>
        </div>
      </div>
    </header>
  );
}
