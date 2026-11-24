import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

function Node({ label, detail, tone }: { label: string; detail: string; tone: string }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${tone}`}>
      <p className="text-[11px] font-bold text-navy">{label}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-muted">{detail}</p>
    </div>
  );
}

export function KemVsSignature() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          <LockKeyhole className="h-3.5 w-3.5" /> KEM · confidentiality
        </p>
        <div className="mt-3 space-y-2">
          <Node label="1. KeyGen" detail="Recipient creates encapsulation key ek and decapsulation key dk." tone="border-brand-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-400" />
          <Node label="2. Encaps(ek)" detail="Sender gets ciphertext c and a fresh shared key K." tone="border-brand-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-400" />
          <Node label="3. Decaps(dk, c)" detail="Recipient recovers K. A tampered c must yield a rejection key." tone="border-brand-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-400" />
          <Node label="4. AEAD(K)" detail="The shared key protects the actual application data." tone="border-emerald-200 bg-emerald-50" />
        </div>
        <p className="mt-3 text-[9px] text-muted"><Cite id="fips203" locator="§7.1–7.3" /></p>
      </div>

      <div className="rounded-xl border border-coral-200 bg-coral-50/60 p-4">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-coral-600">
          <ShieldCheck className="h-3.5 w-3.5" /> Signature · authenticity
        </p>
        <div className="mt-3 space-y-2">
          <Node label="1. KeyGen" detail="Signer creates a public verification key and a secret signing key." tone="border-coral-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-coral-400" />
          <Node label="2. Sign(sk, m)" detail="Signer produces a signature σ over the message m." tone="border-coral-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-coral-400" />
          <Node label="3. Verify(pk, m, σ)" detail="Anyone can check the signature; no secret is needed." tone="border-coral-200 bg-white" />
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-coral-400" />
          <Node label="4. Decision" detail="Valid signatures give authenticity and integrity, not confidentiality." tone="border-emerald-200 bg-emerald-50" />
        </div>
        <p className="mt-3 text-[9px] text-muted"><Cite id="fips204" locator="§5" /></p>
      </div>
    </div>
  );
}
