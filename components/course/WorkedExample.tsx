import { ArrowRight, CheckCircle2, Sigma } from "lucide-react";

export function WorkedExample({ title, steps, result }: { title: string; steps: string[]; result: string }) {
  return (
    <div className="not-prose my-7 rounded-2xl border border-violet-200 bg-violet-50/60 p-5">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
        <Sigma className="h-3.5 w-3.5" /> worked example
      </p>
      <h3 className="mt-1 text-base font-bold text-navy">{title}</h3>
      <ol className="mt-3 space-y-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-2 text-xs leading-5 text-body">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white font-mono text-[9px] font-bold text-violet-700">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-xs leading-5 text-emerald-900"><strong className="font-semibold">Result:</strong> {result}</p>
      </div>
    </div>
  );
}
