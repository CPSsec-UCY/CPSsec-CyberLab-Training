"use client";

import { ArrowRight } from "lucide-react";
import { SequenceControls } from "@/components/visualizers/SequenceControls";
import { useSequencePlayer } from "@/components/visualizers/useSequencePlayer";

export interface ProcessStep {
  title: string;
  detail: string;
  tone?: "brand" | "coral" | "teal" | "gold";
}

const TONES: Record<NonNullable<ProcessStep["tone"]>, string> = {
  brand: "border-brand-200 bg-brand-50",
  coral: "border-coral-200 bg-coral-50",
  teal: "border-emerald-200 bg-emerald-50",
  gold: "border-gold-200 bg-gold-50",
};

export function ProcessFlow({ steps }: { steps: ProcessStep[] }) {
  const player = useSequencePlayer(steps.length, 2600);

  return (
    <section className="not-prose my-7 rounded-2xl border border-line bg-mist-50 p-4" aria-label="Animated process diagram">
      <div
        className="overflow-x-auto overscroll-x-contain rounded-xl"
        role="region"
        aria-label="Scrollable process steps"
        tabIndex={0}
      >
        <ol className="flex min-w-[680px] items-stretch gap-2" role="list">
          {steps.map((step, index) => {
            const active = index === player.step;
            const complete = index < player.step;
            return (
              <li key={step.title} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
                <div
                  className={`relative h-full flex-1 overflow-hidden rounded-xl border p-3 transition-colors duration-300 ${TONES[step.tone ?? "brand"]} ${
                    active ? "ring-2 ring-brand-400/50" : complete ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 animate-flow-progress bg-brand-500" aria-hidden="true" /> : null}
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">step {index + 1}</p>
                  <p className="mt-1 text-[11px] font-bold text-navy">{step.title}</p>
                  <p className="mt-1 text-[9px] leading-4 text-body">{step.detail}</p>
                </div>
                {index < steps.length - 1 ? (
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-colors ${index === player.step ? "text-brand-600" : "text-brand-300"}`}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
      <SequenceControls
        label="process diagram"
        step={player.step}
        length={steps.length}
        playing={player.playing}
        onSelect={player.select}
        onToggle={player.toggle}
        onRestart={player.restart}
      />
    </section>
  );
}
