import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Flag, Layers, Sigma } from "lucide-react";
import { getAllModules, getCurriculumStats } from "@/lib/modules";
import { getModulesByTrack } from "@/lib/modules";
import { getTrack } from "@/lib/tracks";
import { LENSES } from "@/lib/lenses";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { ProgressSummary } from "@/components/learning/ProgressSummary";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Curriculum roadmap",
  description:
    "A sequenced path through quantum threats, public-key foundations, lattice PQC, hash-based signatures, TLS integration and side-channel resilience.",
};

export default function CurriculumPage() {
  const modules = getAllModules();
  const groups = getModulesByTrack();
  const stats = getCurriculumStats();

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <div>
          <p className="eyebrow">Curriculum</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            A roadmap through the post-quantum transition.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Eight flagship modules, each authored across all four depth lenses. Follow the numbered order
            for a complete pass, or use the lens switcher to jump directly to the layer you need.
          </p>
        </div>
        <div className="space-y-3">
          <ProgressSummary total={modules.length} />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-ink-850/50 p-3 text-center">
              <p className="font-mono text-xl text-white">{stats.modules}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">modules</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink-850/50 p-3 text-center">
              <p className="font-mono text-xl text-white">{stats.citations}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">cited</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-ink-850/50 p-3 text-center">
              <p className="font-mono text-xl text-white">{stats.tracks}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">tracks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-4">
        {LENSES.map((lens) => (
          <div key={lens.level} className={`rounded-xl border ${lens.accentBorder} ${lens.accentBg} p-3`}>
            <p className={`font-mono text-[9px] uppercase tracking-[0.14em] ${lens.accentText}`}>L{lens.level} · {lens.short}</p>
            <p className="mt-1 text-xs text-slate-300">{lens.name}</p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">{lens.audience}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 space-y-14">
        {groups.map((group, groupIndex) => {
          const track = getTrack(group.track);
          return (
            <section key={group.track} aria-labelledby={`track-${groupIndex}`}>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${track.dot}`} />
                    <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${track.text}`}>
                      track {String(groupIndex + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <h2 id={`track-${groupIndex}`} className="mt-2 text-2xl font-semibold text-white">
                    {group.track}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">{track.description}</p>
                </div>
                <span className="chip">{group.modules.length} modules</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.modules.map((module) => (
                  <ModuleCard key={module.slug} module={module} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-16 grid gap-4 rounded-2xl border border-white/10 bg-ink-850/50 p-6 md:grid-cols-3">
        <div className="flex gap-3">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-cyber-cyan" />
          <div>
            <h3 className="text-sm font-semibold text-white">New to the area?</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Read <Link href="/learn/quantum-threat/" className="text-cyber-cyan hover:underline">The quantum threat</Link> at L1, then{" "}
              <Link href="/learn/asymmetric-primitives/" className="text-cyber-cyan hover:underline">public-key primitives</Link>.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Flag className="mt-0.5 h-5 w-5 shrink-0 text-cyber-violet" />
          <div>
            <h3 className="text-sm font-semibold text-white">Here for PQC?</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Start with <Link href="/learn/ntt-polynomials/" className="text-cyber-cyan hover:underline">NTT &amp; polynomial rings</Link>, then the{" "}
              <Link href="/learn/ml-kem/" className="text-cyber-cyan hover:underline">ML-KEM</Link> deep dive.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Sigma className="mt-0.5 h-5 w-5 shrink-0 text-cyber-amber" />
          <div>
            <h3 className="text-sm font-semibold text-white">Prefer to build?</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Jump to the <Link href="/lab/" className="text-cyber-cyan hover:underline">Wasm lab</Link> and{" "}
              <Link href="/learn/side-channel/" className="text-cyber-cyan hover:underline">constant-time module</Link>.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/[0.05] p-5">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-cyber-cyan" />
          <p className="text-sm text-slate-300">
            Every module covers L1–L4. The switcher preserves scroll position and your last lens choice.
          </p>
        </div>
        <Link href="/learn/ml-kem/" className="btn-primary">
          Start module 05 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
