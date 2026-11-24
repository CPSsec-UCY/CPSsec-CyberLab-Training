"use client";

import { useState } from "react";
import { ArrowRight, KeyRound, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const PHASES = [
  { name: "X25519", detail: "Client and server derive the same classical shared secret from their ephemeral key pairs." },
  { name: "ML-KEM", detail: "The client encapsulates to the server's ML-KEM key; both sides obtain the same post-quantum shared secret." },
  { name: "Combine", detail: "The two component secrets are concatenated in the specified order to form the input keying material." },
  { name: "HKDF", detail: "HKDF extracts and expands the input keying material using the negotiated context label." },
  { name: "Traffic key", detail: "Both peers derive a directional traffic key. Different context labels produce different keys and a failed handshake." },
];

const CLASSICAL_SECRET = "a1b2c3d4e5f60718";
const PQ_SECRET = "102030405060708090a0b0c0d0e0f000";
const SERVER_CONTEXT = "tls13-hybrid-demo";
const DEFAULT_CONTEXT = "tls13-hybrid-demo";

function toyHash(input: string) {
  let first = 2166136261;
  let second = 2246822519;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619) >>> 0;
    second = Math.imul(second ^ (code + index), 3266489917) >>> 0;
  }
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
}

function toyHkdf(input: string, context: string) {
  return [0, 1, 2, 3].map((counter) => toyHash(`${context}\u0000${input}\u0000${counter}`)).join("");
}

export function HybridCombinerLab() {
  const [phase, setPhase] = useState(0);
  const [classicalBroken, setClassicalBroken] = useState(false);
  const [pqBroken, setPqBroken] = useState(false);
  const [context, setContext] = useState(DEFAULT_CONTEXT);

  const ikm = `${CLASSICAL_SECRET}${PQ_SECRET}`;
  const clientPrk = toyHkdf(ikm, context);
  const serverPrk = toyHkdf(ikm, SERVER_CONTEXT);
  const clientTrafficKey = toyHkdf(clientPrk, `${context}|client traffic`);
  const serverTrafficKey = toyHkdf(serverPrk, `${SERVER_CONTEXT}|client traffic`);
  const keysMatch = clientTrafficKey === serverTrafficKey;
  const unknownComponents = Number(!classicalBroken) + Number(!pqBroken);
  const status = !keysMatch
    ? "Blocked · context mismatch"
    : unknownComponents === 0
      ? "Unsafe · both secrets known"
      : unknownComponents === 2
        ? "Safe · both secrets unknown"
        : "Safe · one secret unknown";
  const safe = keysMatch && unknownComponents > 0;

  function reset() {
    setPhase(0);
    setClassicalBroken(false);
    setPqBroken(false);
    setContext(DEFAULT_CONTEXT);
  }

  return (
    <VisualizerShell
      title="Hybrid KEM combiner"
      description="Illustrative X25519 + ML-KEM secrets, concatenation and a toy HKDF stand-in."
      onReset={reset}
      controls={
        <>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-body">
            <input type="checkbox" checked={classicalBroken} onChange={(event) => setClassicalBroken(event.target.checked)} className="accent-rose-500" />
            Break X25519
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-body">
            <input type="checkbox" checked={pqBroken} onChange={(event) => setPqBroken(event.target.checked)} className="accent-rose-500" />
            Break ML-KEM
          </label>
          <label className="block">
            <span className="sr-only">Client context label</span>
            <input
              type="text"
              value={context}
              maxLength={40}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Context label"
              className="w-40 rounded-lg border border-line bg-white px-2.5 py-1.5 font-mono text-[10px] text-navy focus:border-brand-300"
              aria-label="Client context label"
            />
          </label>
          <button
            type="button"
            onClick={() => setPhase((value) => Math.min(value + 1, PHASES.length - 1))}
            disabled={phase === PHASES.length - 1}
            className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="h-3 w-3" />
          </button>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">Illustrative only.</strong> The hex values and hash function are toys, not cryptographic implementations. In a real hybrid KEM, use the standard group encoding, a reviewed combiner and HKDF labels, and bind the context to the negotiated protocol and transcript. With a sound combiner, the traffic key stays protected while at least one component secret is unknown to the adversary. If both are known, or the peers use different contexts, this safety argument fails. Never silently fall back after a hybrid error.
        </span>
      }
    >
      <div className="flex flex-wrap gap-1.5" aria-label="Hybrid key derivation phases">
        {PHASES.map((item, index) => (
          <StepButton key={item.name} active={phase === index} done={index < phase} onClick={() => setPhase(index)}>
            {item.name}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700">Client</p>
          <p className="mt-1 font-mono text-[10px] text-navy">ephemeral key pair</p>
        </div>
        <div className="flex justify-center"><ArrowRight className="h-5 w-5 rotate-90 text-brand-400 sm:rotate-0" /></div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">Server</p>
          <p className="mt-1 font-mono text-[10px] text-navy">ephemeral key pair</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="Unknown components" value={`${unknownComponents} / 2`} tone={unknownComponents > 0 ? "teal" : "rose"} />
        <Metric label="Traffic keys" value={keysMatch ? "Match" : "Differ"} tone={keysMatch ? "teal" : "rose"} />
        <Metric label="Handshake" value={safe ? "Protected" : !keysMatch ? "Fails" : "Exposed"} tone={safe ? "teal" : "rose"} />
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[11px] leading-5 ${safe ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} aria-live="polite">
        {safe ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>
          <strong>{status}.</strong>{" "}
          {!keysMatch
            ? `The client uses "${context || "(empty)"}" while the server uses "${SERVER_CONTEXT}". Domain separation makes the derived keys differ, so Finished cannot verify.`
            : unknownComponents === 0
              ? "The adversary knows both component secrets and can derive the same traffic key. Hybrid composition cannot recover security after both inputs fail."
              : unknownComponents === 2
                ? "The adversary knows neither component secret. Even a future break in one algorithm would leave the other component protecting the key."
                : classicalBroken
                  ? "X25519 is exposed, but the ML-KEM secret remains unknown. The hybrid key is still protected under the combiner assumptions."
                  : "ML-KEM is exposed, but the X25519 secret remains unknown. The hybrid key is still protected under the combiner assumptions."}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          <div className={`rounded-xl border p-3 ${classicalBroken ? "border-rose-200 bg-rose-50" : "border-line bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted"><KeyRound className="h-3.5 w-3.5 text-brand-600" /> X25519 shared secret</p>
              <span className={`text-[9px] font-bold ${classicalBroken ? "text-rose-700" : "text-emerald-700"}`}>{classicalBroken ? "known to adversary" : "unknown"}</span>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-navy">{CLASSICAL_SECRET}</p>
          </div>
          <div className={`rounded-xl border p-3 ${pqBroken ? "border-rose-200 bg-rose-50" : "border-line bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted"><LockKeyhole className="h-3.5 w-3.5 text-brand-600" /> ML-KEM shared secret</p>
              <span className={`text-[9px] font-bold ${pqBroken ? "text-rose-700" : "text-emerald-700"}`}>{pqBroken ? "known to adversary" : "unknown"}</span>
            </div>
            <p className="mt-2 break-all font-mono text-[11px] text-navy">{PQ_SECRET}</p>
          </div>
          <div className="rounded-xl border border-line bg-mist-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Concatenation · IKM</p>
            <p className="mt-2 break-all font-mono text-[10px] leading-5 text-navy">{ikm}</p>
            <p className="mt-1 text-[9px] text-muted">X25519 first, then ML-KEM; production encoding and domain separation are specified by the group.</p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-[10px] leading-5 text-body" aria-live="polite">
            <strong className="text-brand-800">{PHASES[phase].name}.</strong> {PHASES[phase].detail}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Toy HKDF output · client</p>
            <p className="mt-1 break-all font-mono text-[10px] leading-5 text-navy">{clientPrk}</p>
            <p className="mt-2 text-[9px] text-muted">context = {context || "(empty)"}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Toy HKDF output · server</p>
            <p className="mt-1 break-all font-mono text-[10px] leading-5 text-navy">{serverPrk}</p>
            <p className="mt-2 text-[9px] text-muted">context = {SERVER_CONTEXT}</p>
          </div>
          <div className="rounded-xl border border-line bg-navy p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-200">Final traffic keys · illustrative</p>
            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.08em] text-mist-300">client</p>
            <p className={`mt-1 break-all font-mono text-[10px] leading-5 ${keysMatch ? "text-emerald-300" : "text-rose-300"}`}>{clientTrafficKey}</p>
            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.08em] text-mist-300">server</p>
            <p className={`mt-1 break-all font-mono text-[10px] leading-5 ${keysMatch ? "text-emerald-300" : "text-rose-300"}`}>{serverTrafficKey}</p>
            <p className="mt-2 text-[9px] text-mist-300">{keysMatch ? "Keys match; the handshake can proceed." : "Keys differ; Finished verification fails."}</p>
          </div>
        </div>
      </div>
    </VisualizerShell>
  );
}
