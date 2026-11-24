import { ArrowRight, Fingerprint, KeyRound } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function HmacHkdfFlow() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          <Fingerprint className="h-3.5 w-3.5" /> HMAC · authenticate
        </p>
        <div className="mt-3 space-y-2 font-mono text-[10px]">
          <div className="rounded-lg border border-line bg-white p-2.5">
            <p className="text-muted">key K</p>
            <p className="mt-1 text-navy">K ⊕ ipad</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-2.5">
            <p className="text-muted">inner hash</p>
            <p className="mt-1 break-all text-navy">H((K ⊕ ipad) ‖ message)</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-2.5">
            <p className="text-muted">outer hash</p>
            <p className="mt-1 break-all text-navy">H((K ⊕ opad) ‖ inner)</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
            <p className="text-emerald-700">tag · constant-time compare</p>
          </div>
        </div>
        <p className="mt-3 text-[9px] text-muted"><Cite id="rfc2104" locator="§2–3" /></p>
      </div>

      <div className="rounded-xl border border-coral-200 bg-coral-50/60 p-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-coral-600">
          <KeyRound className="h-3.5 w-3.5" /> HKDF · derive
        </p>
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-line bg-white p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">extract</p>
            <p className="mt-1 font-mono text-[10px] text-navy">PRK = HMAC_salt(IKM)</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">concentrates non-uniform input keying material</p>
          </div>
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-coral-400" />
          <div className="rounded-lg border border-line bg-white p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">expand</p>
            <p className="mt-1 font-mono text-[10px] text-navy">OKM = HMAC(PRK, info ‖ counter)</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">info binds protocol, direction, version and purpose</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-line bg-white p-2 text-center text-[9px] font-semibold text-navy">traffic key</div>
            <div className="rounded-lg border border-line bg-white p-2 text-center text-[9px] font-semibold text-navy">MAC key</div>
          </div>
        </div>
        <p className="mt-3 text-[9px] text-muted"><Cite id="rfc5869" locator="§2–3" /></p>
      </div>
    </div>
  );
}
