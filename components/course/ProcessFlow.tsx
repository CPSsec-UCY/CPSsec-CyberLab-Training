import { ArrowRight } from "lucide-react";

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
  return (
    <div className="not-prose my-7 overflow-x-auto rounded-2xl border border-line bg-mist-50 p-4">
      <div className="flex min-w-[680px] items-stretch gap-2">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-1 items-center gap-2">
            <div className={`h-full flex-1 rounded-xl border p-3 ${TONES[step.tone ?? "brand"]}`}>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">step {index + 1}</p>
              <p className="mt-1 text-[11px] font-bold text-navy">{step.title}</p>
              <p className="mt-1 text-[9px] leading-4 text-body">{step.detail}</p>
            </div>
            {index < steps.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 text-brand-400" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
