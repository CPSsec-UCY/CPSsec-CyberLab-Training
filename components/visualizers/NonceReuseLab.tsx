"use client";

import { useState } from "react";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const TOY_KEY = [0x03, 0x01, 0x04, 0x01, 0x05, 0x09, 0x02, 0x06];
const FIRST_NONCE = [0xa0, 0x00, 0x01];
const SECOND_NONCE = [0xa0, 0x00, 0x02];
const DEFAULT_FIRST = "MEET AT 07";
const DEFAULT_SECOND = "MEET AT 09";
const MESSAGE_LIMIT = 12;

const INSPECT_STAGES = [
  {
    title: "Encrypt",
    detail: "Each plaintext is XORed with a toy keystream. The key is fixed; toggling reuse makes the two nonce inputs identical or distinct.",
  },
  {
    title: "Compare XOR",
    detail: "When the keystream repeats, XORing the ciphertexts cancels it and reveals the XOR of the overlapping plaintext bytes.",
  },
  {
    title: "Authentication risk",
    detail: "Real GCM also repeats its tag mask under nonce reuse. Repeated GHASH equations can expose the authentication key and allow tag forgery.",
  },
];

function encode(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function toyKeystream(key: readonly number[], nonce: readonly number[], length: number): number[] {
  let state = 0x811c9dc5;
  for (const byte of [...key, ...nonce]) {
    state ^= byte;
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  return Array.from({ length }, () => {
    state = (Math.imul(state, 0x000343fd) + 0x269ec3) >>> 0;
    return (state >>> 24) & 0xff;
  });
}

function xorBytes(left: readonly number[], right: readonly number[]): number[] {
  const length = Math.min(left.length, right.length);
  return Array.from({ length }, (_, index) => left[index] ^ right[index]);
}

function toHex(bytes: readonly number[]): string {
  return bytes.length > 0 ? bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ") : "—";
}

function toyChecksum(bytes: readonly number[]): number[] {
  let state = 0x9e3779b9;
  for (const byte of bytes) {
    state ^= byte;
    state = Math.imul(state, 0x85ebca6b) >>> 0;
  }
  return [(state >>> 24) & 0xff, (state >>> 16) & 0xff, (state >>> 8) & 0xff, state & 0xff];
}

function toyTag(ciphertext: readonly number[], mask: readonly number[]): number[] {
  return toyChecksum(ciphertext).map((byte, index) => byte ^ mask[index]);
}

function ByteRow({
  label,
  bytes,
  tone = "brand",
  hint,
}: {
  label: string;
  bytes: readonly number[];
  tone?: "brand" | "coral" | "teal" | "gold";
  hint?: string;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    coral: "bg-coral-50 text-coral-600 border-coral-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    gold: "bg-gold-50 text-gold-600 border-gold-100",
  };

  return (
    <div className="rounded-lg border border-line bg-white p-2.5" role="group" aria-label={`${label}: ${toHex(bytes)}`}>
      <div className="flex flex-wrap items-center justify-between gap-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
        {hint ? <p className="text-[9px] text-muted">{hint}</p> : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
        {bytes.length > 0 ? (
          bytes.map((byte, index) => (
            <span key={`${index}-${byte}`} className={`rounded border px-1.5 py-1 font-mono text-[10px] ${tones[tone]}`}>
              {byte.toString(16).padStart(2, "0")}
            </span>
          ))
        ) : (
          <span className="font-mono text-[10px] text-muted">no bytes</span>
        )}
      </div>
    </div>
  );
}

export function NonceReuseLab() {
  const [first, setFirst] = useState(DEFAULT_FIRST);
  const [second, setSecond] = useState(DEFAULT_SECOND);
  const [reuse, setReuse] = useState(false);
  const [stage, setStage] = useState(0);

  const firstBytes = encode(first);
  const secondBytes = encode(second);
  const firstNonce = FIRST_NONCE;
  const secondNonce = reuse ? FIRST_NONCE : SECOND_NONCE;
  const streamLength = Math.max(firstBytes.length, secondBytes.length);
  const firstStream = toyKeystream(TOY_KEY, firstNonce, streamLength);
  const secondStream = toyKeystream(TOY_KEY, secondNonce, streamLength);
  const firstCiphertext = firstBytes.map((byte, index) => byte ^ firstStream[index]);
  const secondCiphertext = secondBytes.map((byte, index) => byte ^ secondStream[index]);
  const plaintextXor = xorBytes(firstBytes, secondBytes);
  const ciphertextXor = xorBytes(firstCiphertext, secondCiphertext);
  const firstMask = toyKeystream(TOY_KEY, firstNonce, 4).map((byte) => byte ^ 0xa5);
  const secondMask = toyKeystream(TOY_KEY, secondNonce, 4).map((byte) => byte ^ 0xa5);
  const firstTag = toyTag(firstCiphertext, firstMask);
  const secondTag = toyTag(secondCiphertext, secondMask);
  const overlappingBytes = plaintextXor.length;
  const current = INSPECT_STAGES[stage];

  function reset() {
    setFirst(DEFAULT_FIRST);
    setSecond(DEFAULT_SECOND);
    setReuse(false);
    setStage(0);
  }

  return (
    <VisualizerShell
      title="AES-GCM nonce reuse lab"
      description="Edit two short messages and watch a repeated toy keystream cancel out of the ciphertext XOR."
      onReset={reset}
      controls={
        <>
          <button
            type="button"
            aria-pressed={reuse}
            onClick={() => setReuse((value) => !value)}
            className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${
              reuse ? "border-coral-300 bg-coral-50 text-coral-600" : "border-line bg-white text-muted hover:border-brand-200 hover:text-navy"
            }`}
          >
            {reuse ? "same key + nonce" : "reuse nonce"}
          </button>
          <button
            type="button"
            onClick={() => setStage((value) => Math.min(value + 1, INSPECT_STAGES.length - 1))}
            disabled={stage === INSPECT_STAGES.length - 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </>
      }
      footer={
        <p>
          Illustrative XOR and checksum math only — not AES or AES-GCM. Real GCM uses AES counter blocks and GHASH; reusing a nonce under the same key can expose the authentication key and enable forgery, so the affected key must be retired.
        </p>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Message A</span>
          <input
            type="text"
            value={first}
            maxLength={MESSAGE_LIMIT}
            onChange={(event) => setFirst(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white"
            placeholder="first plaintext"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Message B</span>
          <input
            type="text"
            value={second}
            maxLength={MESSAGE_LIMIT}
            onChange={(event) => setSecond(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white"
            placeholder="second plaintext"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-mist-50 px-3 py-2">
        <p className="font-mono text-[10px] text-body">toy key: {toHex(TOY_KEY)}</p>
        <p className={`font-mono text-[10px] font-bold ${reuse ? "text-coral-600" : "text-teal-600"}`} role="status">
          {reuse ? "nonce collision: streams repeat" : "distinct nonces: streams differ"}
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {[
          { title: "Encryption A", plaintext: firstBytes, nonce: firstNonce, stream: firstStream, ciphertext: firstCiphertext },
          { title: "Encryption B", plaintext: secondBytes, nonce: secondNonce, stream: secondStream, ciphertext: secondCiphertext },
        ].map((item) => (
          <section
            key={item.title}
            className={`rounded-xl border bg-white p-3 transition motion-safe:duration-300 motion-reduce:transition-none ${stage === 0 ? "border-brand-300" : "border-line"}`}
            aria-labelledby={`${item.title.replace(" ", "-").toLowerCase()}-title`}
          >
            <h4 id={`${item.title.replace(" ", "-").toLowerCase()}-title`} className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">{item.title}</h4>
            <div className="mt-3 space-y-2">
              <ByteRow label="nonce" bytes={item.nonce} tone="gold" />
              <ByteRow label="plaintext" bytes={item.plaintext} tone="brand" />
              <ByteRow label="toy keystream" bytes={item.stream} tone="teal" />
              <ByteRow label="ciphertext = P XOR stream" bytes={item.ciphertext} tone="coral" />
            </div>
          </section>
        ))}
      </div>

      <section className={`mt-4 rounded-xl border p-4 transition motion-safe:duration-300 motion-reduce:transition-none ${stage === 1 ? "border-brand-300 bg-brand-50/50" : "border-line bg-mist-50"}`} aria-labelledby="xor-comparison-title">
        <h4 id="xor-comparison-title" className="text-xs font-bold text-navy">XOR comparison</h4>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ByteRow label="P1 XOR P2" bytes={plaintextXor} tone={reuse ? "coral" : "brand"} hint={`${overlappingBytes} shared byte${overlappingBytes === 1 ? "" : "s"}`} />
          <ByteRow
            label="C1 XOR C2"
            bytes={ciphertextXor}
            tone={reuse ? "coral" : "teal"}
            hint={reuse && overlappingBytes > 0 ? "equals P1 XOR P2" : "streams do not cancel"}
          />
        </div>
        <p className="mt-3 text-[11px] leading-5 text-body" aria-live="polite">
          {reuse
            ? overlappingBytes > 0
              ? "The repeated keystream cancels: C1 XOR C2 = P1 XOR P2. Guessing or knowing one overlapping plaintext reveals the other."
              : "The messages have no overlapping bytes, so there is no plaintext XOR to recover in this toy example."
            : "The toy nonces produce different keystreams, so ciphertext XOR does not directly reveal plaintext XOR. Real nonce uniqueness must still be guaranteed by the protocol."}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="XOR relation" value={reuse && overlappingBytes > 0 ? "leaked" : "not aligned"} tone={reuse && overlappingBytes > 0 ? "coral" : "teal"} />
          <Metric label="Overlapping bytes" value={overlappingBytes} tone="gold" />
        </div>
      </section>

      <section className={`mt-4 rounded-xl border p-4 transition motion-safe:duration-300 motion-reduce:transition-none ${stage === 2 ? "border-coral-300 bg-coral-50/50" : "border-line bg-mist-50"}`} aria-labelledby="authentication-risk-title">
        <div className="flex items-start gap-2">
          <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${reuse ? "text-coral-600" : "text-teal-600"}`} aria-hidden="true" />
          <div>
            <h4 id="authentication-risk-title" className="text-xs font-bold text-navy">Authentication-key and tag risk</h4>
            <p className="mt-1 text-[11px] leading-5 text-body">
              These four-byte masks stand in for GCM&apos;s tag mask E<sub>K</sub>(J₀). Reuse repeats the mask; in real GCM, known-plaintext GHASH equations can then recover the authentication key H and support forged tags.
            </p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ByteRow label="toy tag mask A" bytes={firstMask} tone="gold" />
          <ByteRow label="toy tag mask B" bytes={secondMask} tone={reuse ? "coral" : "teal"} hint={reuse ? "identical" : "different"} />
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <ByteRow label="toy tag A" bytes={firstTag} tone="brand" />
          <ByteRow label="toy tag B" bytes={secondTag} tone="brand" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Auth-key exposure" value={reuse ? "possible" : "not from reuse"} tone={reuse ? "coral" : "teal"} />
          <Metric label="Tag forgery risk" value={reuse ? "HIGH" : "normal model"} tone={reuse ? "coral" : "gold"} />
        </div>
        <p className={`mt-3 text-[11px] font-semibold leading-5 ${reuse ? "text-coral-700" : "text-body"}`} role="status">
          {reuse
            ? "Stop using this key. Rotate it and treat both affected messages as compromised; a longer tag does not repair nonce reuse."
            : "Distinct nonces avoid this specific failure. Counter rollback, cloned state and excessive random-nonce usage can still violate uniqueness."}
        </p>
      </section>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Nonce reuse inspection stages">
        {INSPECT_STAGES.map((item, index) => (
          <StepButton key={item.title} active={stage === index} done={index < stage} onClick={() => setStage(index)}>
            {item.title}
          </StepButton>
        ))}
      </nav>

      <div className="mt-3 rounded-xl border border-line bg-white p-3" aria-live="polite">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Focus: {current.title}</p>
        <p className="mt-1 text-[11px] leading-5 text-body">{current.detail}</p>
      </div>
    </VisualizerShell>
  );
}
