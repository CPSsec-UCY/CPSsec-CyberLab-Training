import { ArrowRight, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";

export function MlKemFlow() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">recipient</p>
          <p className="mt-1 text-[11px] font-bold text-navy">KeyGen → (ek, dk)</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">ek is public; dk contains the secret and rejection value z.</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-400 lg:block" />
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">sender</p>
          <p className="mt-1 text-[11px] font-bold text-navy">Encaps(ek) → (c, K)</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">Samples m; derives K and randomness r; encrypts m.</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-400 lg:block" />
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">recipient</p>
          <p className="mt-1 text-[11px] font-bold text-navy">Decaps(dk, c) → K′</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">Decrypts m′, re-derives (K′, r′), re-encrypts and compares.</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-[10px] leading-4 text-emerald-800">c′ = c: return K′. The recipient and sender share the same key.</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-[10px] leading-4 text-rose-800">c′ ≠ c: implicit reject. Return J(z, c), a pseudorandom key.</p>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
        <RefreshCw className="h-3 w-3" /> the FO re-encryption check turns CPA security into IND-CCA2
      </p>
    </div>
  );
}
