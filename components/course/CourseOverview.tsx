import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, ListChecks, Target, TerminalSquare } from "lucide-react";
import type { Module } from "@/lib/types";
import { LENSES } from "@/lib/lenses";

export function CourseOverview({ module }: { module: Module }) {
  return (
    <section className="container-page pt-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
              <Target className="h-3.5 w-3.5" /> what you will learn
            </p>
            <h2 className="mt-2 text-xl font-bold text-navy">Course outcomes</h2>
            <ul className="mt-4 space-y-2.5">
              {module.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm leading-6 text-body">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {outcome}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip"><Clock className="h-3.5 w-3.5" /> {module.readingTime} min guided study</span>
              <span className="chip"><BookOpen className="h-3.5 w-3.5" /> full guide by default</span>
              <Link href={`#terminal-${module.slug}`} className="chip border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300">
                <TerminalSquare className="h-3.5 w-3.5" /> guided terminal
              </Link>
              <Link href={`#linux-terminal-${module.slug}`} className="chip border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300">
                <TerminalSquare className="h-3.5 w-3.5" /> linux practice shell
              </Link>
            </div>
          </div>

          <div className="bg-mist-50/70 p-5 sm:p-6">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
              <ListChecks className="h-3.5 w-3.5" /> course roadmap
            </p>
            <h2 className="mt-2 text-xl font-bold text-navy">Four chapters, one complete model</h2>
            <ol className="mt-4 space-y-2">
              {LENSES.map((lens) => {
                const chapter = module.chapters.find((item) => item.level === lens.level);
                return (
                  <li key={lens.level}>
                    <Link href={`#chapter-${lens.level}`} className="group flex items-start gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-brand-200 hover:shadow-sm">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${lens.accentBorder} ${lens.accentBg} font-mono text-[10px] font-bold ${lens.accentText}`}>
                        L{lens.level}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[9px] font-bold uppercase tracking-[0.1em] ${lens.accentText}`}>{lens.name}</span>
                        <span className="mt-0.5 block text-xs font-semibold leading-5 text-navy group-hover:text-brand-700">{chapter?.title ?? lens.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-[10px] leading-5 text-muted">
              The full guide shows every chapter in sequence. Use the lens switcher to isolate one abstraction layer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
