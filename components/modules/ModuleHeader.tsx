import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import type { ModuleMeta } from "@/lib/types";
import { DIFFICULTY_STYLES, getTrack } from "@/lib/tracks";
import { LensDots } from "@/components/modules/LensDots";
import { ModuleProgressButton } from "@/components/learning/ModuleProgressButton";
import { formatDate } from "@/lib/format";

export function ModuleHeader({ module, citationCount }: { module: ModuleMeta; citationCount: number }) {
  const track = getTrack(module.track);

  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-ink-950/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_15%_-10%,rgba(34,211,238,0.12),transparent_70%)]" />
      <div className="container-page relative py-10 sm:py-14">
        <Link
          href="/curriculum/"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400 hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Curriculum
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className={`chip ${track.border} ${track.text}`}>{module.track}</span>
          <span className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${DIFFICULTY_STYLES[module.difficulty]}`}>
            {module.difficulty}
          </span>
          <span className="chip">{`module ${String(module.order).padStart(2, "0")}`}</span>
        </div>

        <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          {module.title}
        </h1>
        {module.subtitle ? <p className="mt-3 max-w-3xl text-lg text-slate-300">{module.subtitle}</p> : null}
        <p className="mt-4 max-w-3xl leading-7 text-slate-400">{module.summary}</p>

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {module.readingTime} min</span>
          <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {citationCount} sources</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> updated {formatDate(module.updated)}</span>
          <span className="inline-flex items-center gap-1.5">
            <LensDots lenses={module.lenses} showLabels />
          </span>
        </div>

        {module.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {module.tags.map((tag) => (
              <span key={tag} className="chip">{tag}</span>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <ModuleProgressButton slug={module.slug} />
          <span className="text-[11px] text-slate-500">Progress is local to this browser.</span>
        </div>
      </div>
    </header>
  );
}
