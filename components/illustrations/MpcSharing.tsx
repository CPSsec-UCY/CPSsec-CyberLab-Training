import { ArrowRight, CheckCircle2, EyeOff, Users } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function MpcSharing() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
        <Users className="h-3.5 w-3.5" /> threshold secret sharing · 2-of-3
      </p>

      <div className="mt-3 rounded-xl border border-brand-200 bg-white p-3 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">secret</p>
        <p className="mt-1 font-mono text-lg font-bold text-navy">x</p>
      </div>

      <div className="my-2 flex justify-center">
        <ArrowRight className="h-4 w-4 rotate-90 text-brand-400" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["s₁", "s₂", "s₃"].map((share) => (
          <div key={share} className="rounded-xl border border-brand-200 bg-white p-3 text-center">
            <EyeOff className="mx-auto h-4 w-4 text-brand-500" />
            <p className="mt-1 font-mono text-sm font-bold text-navy">{share}</p>
            <p className="text-[8px] text-muted">uniform alone</p>
          </div>
        ))}
      </div>

      <div className="my-2 flex justify-center">
        <ArrowRight className="h-4 w-4 rotate-90 text-brand-400" />
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
        <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />
        <p className="mt-1 text-[10px] font-bold text-emerald-800">any 2 shares reconstruct x</p>
        <p className="text-[9px] text-emerald-700">any 1 share reveals nothing in the threshold model</p>
      </div>
      <p className="mt-3 text-center text-[9px] leading-4 text-muted">
        MPC evaluates circuits over shares. Security is argued by simulation under a stated corruption and network model. <Cite id="shamir1979" locator="pp. 612–613" />
      </p>
    </div>
  );
}
