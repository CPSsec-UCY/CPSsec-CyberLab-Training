import { ArrowRight, EyeOff, Shuffle, ShieldCheck } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function MaskingDiagram() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1.2fr] lg:items-center">
        <div className="rounded-xl border border-rose-200 bg-white p-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">without masking</p>
          <p className="mt-1 font-mono text-lg font-bold text-rose-600">x</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">power and timing may correlate with secret bits</p>
        </div>
        <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-400 lg:rotate-0" />
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700">
            <Shuffle className="h-3.5 w-3.5" /> masking · d+1 shares
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {["s₀", "s₁", "s₂"].map((share) => (
              <div key={share} className="rounded-lg border border-brand-200 bg-brand-50 p-2 text-center">
                <EyeOff className="mx-auto h-3.5 w-3.5 text-brand-500" />
                <p className="mt-1 font-mono text-[11px] font-bold text-navy">{share}</p>
                <p className="text-[8px] text-muted">uniform</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[10px] text-body">x = s₀ ⊕ s₁ ⊕ s₂</p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <p className="text-[10px] leading-4 text-emerald-800">
          In the d-probing model, any d shares are independent of x. Masking must be paired with fresh randomness,
          safe conversions and constant-time code; it does not make timing or faults disappear. <Cite id="nikova-rechberger-rijmen2006" locator="§3.2–3.3 and §4.2" /> <Cite id="faust2018" locator="§4–4.1" />
        </p>
      </div>
    </div>
  );
}
