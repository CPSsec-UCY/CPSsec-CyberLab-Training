"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Eye, Lightbulb, ListChecks, LockKeyhole, RotateCcw } from "lucide-react";

interface GuidedWorkshopProps {
  id: string;
  title: string;
  scenario: string;
  tasks: string[];
  hints: string[];
  solution: string[];
  takeaway?: string;
}

export function GuidedWorkshop({ id, title, scenario, tasks, hints, solution, takeaway }: GuidedWorkshopProps) {
  const [completed, setCompleted] = useState<boolean[]>(() => tasks.map(() => false));
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const progress = useMemo(
    () => (tasks.length ? Math.round((completed.filter(Boolean).length / tasks.length) * 100) : 0),
    [completed, tasks.length],
  );

  function toggleTask(index: number) {
    setCompleted((current) => current.map((value, position) => (position === index ? !value : value)));
  }

  function reset() {
    setCompleted(tasks.map(() => false));
    setRevealedHints(0);
    setShowSolution(false);
  }

  return (
    <section id={id} className="not-prose my-10 overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-card scroll-mt-40">
      <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-coral-50 px-5 py-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
          <ListChecks className="h-3.5 w-3.5" /> guided workshop
        </p>
        <h3 className="mt-1 text-xl font-bold text-navy">{title}</h3>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-xl border border-line bg-mist-50 p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Scenario</p>
          <p className="mt-1 text-sm leading-6 text-body">{scenario}</p>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy">Your tasks</p>
            <span className="font-mono text-[10px] text-brand-700">{progress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-200">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 space-y-2">
            {tasks.map((task, index) => (
              <button
                key={task}
                type="button"
                onClick={() => toggleTask(index)}
                aria-pressed={completed[index]}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  completed[index] ? "border-emerald-200 bg-emerald-50" : "border-line bg-white hover:border-brand-200"
                }`}
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  completed[index] ? "border-emerald-500 bg-emerald-500 text-white" : "border-line-strong bg-white"
                }`}>
                  {completed[index] ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className={`text-xs leading-5 ${completed[index] ? "text-emerald-900" : "text-body"}`}>{task}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gold-200 bg-gold-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-700">
              <Lightbulb className="h-3.5 w-3.5" /> hints
            </p>
            <button
              type="button"
              onClick={() => setRevealedHints((value) => Math.min(hints.length, value + 1))}
              disabled={revealedHints >= hints.length}
              className="rounded-lg border border-gold-300 bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-gold-700 disabled:opacity-40"
            >
              Reveal {revealedHints + 1 <= hints.length ? `hint ${revealedHints + 1}` : "all"}
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {hints.slice(0, revealedHints).map((hint, index) => (
              <p key={hint} className="flex gap-2 text-xs leading-5 text-gold-900">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
                <span><strong className="font-semibold">Hint {index + 1}:</strong> {hint}</span>
              </p>
            ))}
            {revealedHints === 0 ? <p className="text-[11px] text-gold-800/70">Try the tasks first. Hints appear one at a time.</p> : null}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowSolution((value) => !value)}
            aria-expanded={showSolution}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700"
          >
            <Eye className="h-3.5 w-3.5" />
            {showSolution ? "Hide worked solution" : "Reveal worked solution"}
            <ChevronDown className={`h-3.5 w-3.5 transition ${showSolution ? "rotate-180" : ""}`} />
          </button>
          {showSolution ? (
            <div className="mt-3 space-y-3 rounded-xl border border-line bg-mist-50 p-4">
              {solution.map((paragraph) => (
                <p key={paragraph} className="text-xs leading-6 text-body">{paragraph}</p>
              ))}
              {takeaway ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-900">
                  <strong className="font-semibold">Takeaway:</strong> {takeaway}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-line pt-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] text-muted">
            <LockKeyhole className="h-3 w-3" /> progress stays in this browser
          </p>
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted hover:text-brand-700">
            <RotateCcw className="h-3 w-3" /> Reset workshop
          </button>
        </div>
      </div>
    </section>
  );
}
