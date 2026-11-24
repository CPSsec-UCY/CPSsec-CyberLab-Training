import { ArrowRight, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function MlDsaFlow() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">keygen</p>
          <p className="mt-1 text-[11px] font-bold text-navy">A, s₁, s₂ → (pk, sk)</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">t = A s₁ + s₂; pk = (ρ, t₁).</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-400 lg:block" />
        <div className="rounded-xl border border-coral-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">sign loop</p>
          <p className="mt-1 text-[11px] font-bold text-navy">y → w → c → z</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">Reject if ||z||∞ ≥ γ₁ − β or hint checks fail; resample.</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-400 lg:block" />
        <div className="rounded-xl border border-brand-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">verify</p>
          <p className="mt-1 text-[11px] font-bold text-navy">(c, z, h)</p>
          <p className="mt-1 text-[9px] leading-4 text-muted">Recompute w′ = A z − c t₁2ᵈ and compare the challenge.</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-[10px] leading-4 text-emerald-800">Accepted: the distribution of z is independent of s₁, so the signature does not leak the key.</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-[10px] leading-4 text-rose-800">Rejected: do not release the candidate. Leaking out-of-bound z can enable key recovery.</p>
        </div>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
        <RefreshCw className="h-3 w-3" /> rejection sampling is a correctness and security control, not just performance <Cite id="fips204" locator="§5" />
      </p>
    </div>
  );
}
