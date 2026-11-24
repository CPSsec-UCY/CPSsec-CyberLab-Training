import { ArrowDown, GitBranch, Leaf, TreePine } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function SlhHypertree() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="mx-auto max-w-md rounded-xl border border-brand-200 bg-white p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">public key</p>
        <p className="mt-1 font-mono text-xs font-bold text-navy">root of the top XMSS tree</p>
      </div>
      <ArrowDown className="mx-auto my-2 h-4 w-4 text-brand-400" />

      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3">
        <p className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700">
          <TreePine className="h-3.5 w-3.5" /> hypertree · d layers
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {["top layer", "middle layer", "bottom layer"].map((layer) => (
            <div key={layer} className="rounded-lg border border-line bg-white p-2">
              <GitBranch className="mx-auto h-4 w-4 text-brand-600" />
              <p className="mt-1 text-[9px] font-semibold text-navy">{layer}</p>
              <p className="text-[8px] text-muted">XMSS tree</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[9px] leading-4 text-muted">
          Each layer signs the roots of the trees below it with a WOTS+ one-time key.
        </p>
      </div>
      <ArrowDown className="mx-auto my-2 h-4 w-4 text-brand-400" />

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-coral-200 bg-coral-50 p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-coral-700">
            <Leaf className="h-3.5 w-3.5" /> FORS
          </p>
          <p className="mt-1 text-[10px] leading-4 text-body">
            Signs a message digest with a few-time forest of random subsets.
          </p>
        </div>
        <div className="rounded-xl border border-gold-200 bg-gold-50 p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gold-700">
            <Leaf className="h-3.5 w-3.5" /> WOTS+
          </p>
          <p className="mt-1 text-[10px] leading-4 text-body">
            A one-time signature chain used by every XMSS tree and the bottom layer.
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-[9px] leading-4 text-muted">
        Statelessness comes from deriving the one-time keys from a secret seed, the message and fresh randomness. <Cite id="fips205" locator="§5, §7–8" />
      </p>
    </div>
  );
}
