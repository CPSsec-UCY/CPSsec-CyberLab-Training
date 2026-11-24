"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";

interface KnowledgeCheckProps {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export function KnowledgeCheck({ question, options, answer, explanation }: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const correct = selected === answer;

  return (
    <div className="not-prose my-7 rounded-2xl border border-cyber-violet/25 bg-cyber-violet/[0.05] p-5">
      <div className="flex items-start gap-3">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyber-violet" aria-hidden />
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyber-violet">Knowledge check</p>
          <p className="mt-2 font-medium leading-6 text-slate-100">{question}</p>

          <div className="mt-4 grid gap-2" role="group" aria-label="Answer choices">
            {options.map((option, index) => {
              const isSelected = selected === index;
              const isAnswer = index === answer;
              const showState = selected !== null && (isSelected || isAnswer);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelected(index)}
                  aria-pressed={isSelected}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    showState && isAnswer
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                      : showState && isSelected && !isAnswer
                        ? "border-cyber-rose/40 bg-cyber-rose/10 text-rose-100"
                        : "border-white/10 bg-ink-950/40 text-slate-300 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="mt-0.5 font-mono text-[10px] uppercase text-slate-500">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showState && isAnswer ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                  {showState && isSelected && !isAnswer ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          <div aria-live="polite">
            {selected !== null ? (
              <div className="mt-4 rounded-lg border border-white/10 bg-ink-950/50 p-3 text-sm leading-6 text-slate-300">
                <p className={`font-mono text-[10px] uppercase tracking-[0.14em] ${correct ? "text-emerald-300" : "text-cyber-rose"}`}>
                  {correct ? "Correct" : "Not quite"}
                </p>
                <p className="mt-1">{explanation}</p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
