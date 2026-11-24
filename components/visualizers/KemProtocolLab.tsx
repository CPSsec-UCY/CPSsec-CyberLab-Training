"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type KemStage = {
  title: string;
  detail: string;
};

const STAGES: KemStage[] = [
  {
    title: "KeyGen",
    detail: "The recipient generates an encapsulation key ek and a secret decapsulation key dk. Only ek is shared with senders.",
  },
  {
    title: "Encaps",
    detail: "The sender combines ek with fresh randomness to produce a ciphertext c and a shared key K. The message bit selects one deterministic toy randomness value.",
  },
  {
    title: "Decaps",
    detail: "The recipient re-encrypts and compares. A matching ciphertext returns K; a mismatch returns a pseudorandom rejection key derived from z and the ciphertext, not an error.",
  },
  {
    title: "Protocol gate",
    detail: "The KEM always returns key bytes. The surrounding AEAD succeeds only when both sides derived the same key; tampering appears later as one generic authentication failure.",
  },
];

function toHex(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function rejectionKey(ciphertext: readonly number[]): number[] {
  const rejectionValue = [0x9e, 0x31, 0x77];
  return ciphertext.map((byte, index) => byte ^ rejectionValue[index] ^ ((index + 1) * 0x21));
}

function KeyCard({
  label,
  sublabel,
  value,
  ready,
  tone = "brand",
}: {
  label: string;
  sublabel: string;
  value: string;
  ready: boolean;
  tone?: "brand" | "coral" | "teal" | "gold";
}) {
  const tones = {
    brand: "border-brand-200 bg-brand-50/60",
    coral: "border-coral-200 bg-coral-50/60",
    teal: "border-teal-200 bg-teal-50/60",
    gold: "border-gold-200 bg-gold-50/60",
  };

  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold text-navy">{label}</p>
        <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted">{ready ? "available" : "pending"}</span>
      </div>
      <p className="mt-0.5 text-[9px] text-muted">{sublabel}</p>
      <p className={`mt-2 break-all font-mono text-[11px] ${ready ? "text-body" : "text-muted"}`}>{value}</p>
    </div>
  );
}

export function KemProtocolLab() {
  const [step, setStep] = useState(0);
  const [bit, setBit] = useState(0);
  const [tampered, setTampered] = useState(false);
  const [signatureTampered, setSignatureTampered] = useState(false);

  const publicKey = [0xa3, 0x71, 0x4e];
  const secretKey = [0x1f, 0x8c, 0x62];
  const cleanCiphertext = [0x4d, 0x02, bit === 1 ? 0xb6 : 0x7a];
  const transmittedCiphertext = tampered ? [cleanCiphertext[0] ^ 0x10, cleanCiphertext[1], cleanCiphertext[2]] : cleanCiphertext;
  const senderKey = bit === 1 ? [0xb6, 0xc1, 0xf4] : [0x7a, 0x2e, 0x90];
  const rejectedKey = rejectionKey(transmittedCiphertext);
  const receiverKey = tampered ? rejectedKey : senderKey;
  const accepted = !tampered;
  const current = STAGES[step];
  const signature = signatureTampered ? [0x8a, 0x11, 0xc7, 0x04] : [0x8a, 0x31, 0xc7, 0x04];

  function reset() {
    setStep(0);
    setBit(0);
    setTampered(false);
    setSignatureTampered(false);
  }

  return (
    <VisualizerShell
      title="KEM protocol lab"
      description="Run a toy KeyGen → Encaps → Decaps → protocol-gate exchange, then compare a signature flow."
      onReset={reset}
      controls={
        <>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white p-1" role="group" aria-label="Message bit">
            <span className="px-1 text-[8px] font-bold uppercase tracking-[0.08em] text-muted">bit</span>
            {[0, 1].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={bit === value}
                onClick={() => {
                  setBit(value);
                  setStep(0);
                }}
                className={`h-6 w-6 rounded font-mono text-[10px] font-bold transition ${
                  bit === value ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-mist-50 hover:text-navy"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={tampered}
            onClick={() => setTampered((value) => !value)}
            className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${
              tampered ? "border-coral-300 bg-coral-50 text-coral-600" : "border-line bg-white text-muted hover:border-brand-200 hover:text-navy"
            }`}
          >
            {tampered ? "ciphertext tampered" : "tamper ciphertext"}
          </button>
          <button
            type="button"
            onClick={() => setStep((value) => Math.min(value + 1, STAGES.length - 1))}
            disabled={step === STAGES.length - 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </>
      }
      footer={
        <p>
          Toy three-byte values illustrate the FO-style contract, not ML-KEM arithmetic. Implicit rejection returns pseudorandom key material on re-encryption failure; only the later AEAD tag exposes invalidity through a single failure path.
        </p>
      }
    >
      <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="KEM state machine">
        {STAGES.map((stage, index) => (
          <li
            key={stage.title}
            aria-current={step === index ? "step" : undefined}
            className={`rounded-xl border px-3 py-3 transition motion-safe:duration-300 motion-reduce:transition-none ${
              step === index
                ? "border-brand-300 bg-brand-50"
                : index < step
                  ? "border-teal-200 bg-teal-50"
                  : "border-line bg-white"
            }`}
          >
            <p className={`font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${step === index ? "text-brand-700" : index < step ? "text-teal-600" : "text-muted"}`}>
              {index + 1}. {stage.title}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-3 rounded-xl border border-line bg-mist-50 p-4" aria-live="polite">
        <h4 className="text-sm font-bold text-navy">{current.title}</h4>
        <p className="mt-1 text-xs leading-5 text-body">{current.detail}</p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-white p-3" aria-labelledby="recipient-keys-title">
          <h4 id="recipient-keys-title" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Recipient</h4>
          <div className="mt-3 space-y-2">
            <KeyCard label="Public key ek" sublabel="safe to publish" value={toHex(publicKey)} ready />
            <KeyCard label="Secret key dk" sublabel="never leaves recipient" value={toHex(secretKey)} ready tone="coral" />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-3" aria-labelledby="sender-values-title">
          <h4 id="sender-values-title" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Sender</h4>
          <div className="mt-3 space-y-2">
            <KeyCard
              label="Ciphertext c"
              sublabel={tampered ? "one byte flipped in transit" : "sent to recipient"}
              value={step >= 1 ? toHex(transmittedCiphertext) : "pending Encaps"}
              ready={step >= 1}
              tone={tampered ? "coral" : "gold"}
            />
            <KeyCard label="Shared key K" sublabel={`encapsulation bit ${bit}`} value={step >= 1 ? toHex(senderKey) : "pending Encaps"} ready={step >= 1} tone="teal" />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-3" aria-labelledby="receiver-values-title">
          <h4 id="receiver-values-title" className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Recipient output</h4>
          <div className="mt-3 space-y-2">
            <KeyCard
              label="Returned key K′"
              sublabel={step < 2 ? "pending Decaps" : accepted ? "matches sender K" : "implicit rejection key"}
              value={step >= 2 ? toHex(receiverKey) : "pending Decaps"}
              ready={step >= 2}
              tone={step >= 2 && !accepted ? "coral" : "teal"}
            />
            <KeyCard
              label="Rejection key K_rej"
              sublabel="toy PRK(z, ciphertext)"
              value={step >= 1 ? toHex(rejectedKey) : "pending ciphertext"}
              ready={step >= 1}
              tone="gold"
            />
          </div>
        </section>
      </div>

      <div
        className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${
          step === 3 && !accepted ? "border-coral-200 bg-coral-50" : step === 3 ? "border-teal-200 bg-teal-50" : "border-line bg-mist-50"
        }`}
        role="status"
      >
        {step === 3 && !accepted ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-coral-600" aria-hidden="true" /> : <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${step === 3 ? "text-teal-600" : "text-brand-400"}`} aria-hidden="true" />}
        <div>
          <p className="text-xs font-bold text-navy">
            {step < 3 ? "Awaiting the protocol gate" : accepted ? "AEAD tag verifies: accept" : "AEAD tag fails: one generic rejection"}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-body">
            {step < 3
              ? "Advance to Decaps, then the protocol gate, to compare the returned keys."
              : accepted
                ? "KEM decapsulation returned K and the AEAD check passed. The KEM alone did not authenticate who sent the ciphertext."
                : "Decapsulation still returned three bytes. The returned rejection key differs from K, so AEAD fails without a KEM validity oracle."}
          </p>
        </div>
      </div>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="KEM stages">
        {STAGES.map((stage, index) => (
          <StepButton key={stage.title} active={step === index} done={index < step} onClick={() => setStep(index)}>
            {stage.title}
          </StepButton>
        ))}
      </nav>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="KEM error returned" value="none" tone="teal" />
        <Metric label="Failure observed by" value="AEAD tag" tone="gold" />
      </div>

      <section className="mt-5 rounded-xl border border-line bg-mist-50 p-4" aria-labelledby="signature-flow-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 id="signature-flow-title" className="text-xs font-bold text-navy">Signature flow: authenticity, not secrecy</h4>
            <p className="mt-1 text-[10px] leading-4 text-muted">The message is public; the signature proves possession of the signing key.</p>
          </div>
          <button
            type="button"
            aria-pressed={signatureTampered}
            onClick={() => setSignatureTampered((value) => !value)}
            className={`self-start rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition sm:self-auto ${
              signatureTampered ? "border-coral-300 bg-coral-50 text-coral-600" : "border-line bg-white text-muted hover:border-brand-200 hover:text-navy"
            }`}
          >
            {signatureTampered ? "restore signature" : "alter signature"}
          </button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-xl border border-brand-200 bg-white p-3">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700">Sign(sk, &quot;dose=2&quot;)</p>
            <p className="mt-2 break-all font-mono text-[10px] text-body">σ = {toHex(signature)}</p>
          </div>
          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-300 sm:rotate-0" aria-hidden="true" />
          <div className={`rounded-xl border p-3 ${signatureTampered ? "border-coral-200 bg-coral-50" : "border-teal-200 bg-teal-50"}`}>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-navy">Verify(vk, m, σ)</p>
            <p className={`mt-2 text-xs font-bold ${signatureTampered ? "text-coral-600" : "text-teal-600"}`} role="status">
              {signatureTampered ? "invalid: message or signature changed" : "valid: signer possessed sk"}
            </p>
          </div>
        </div>
      </section>
    </VisualizerShell>
  );
}
