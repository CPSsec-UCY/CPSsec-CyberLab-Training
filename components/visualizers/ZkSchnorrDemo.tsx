"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, EyeOff, KeyRound, RotateCcw, ShieldAlert } from "lucide-react";

const P = 23;
const G = 5;
const Q = 22;

function powMod(base: number, exponent: number): number {
  let result = 1;
  let value = base % P;
  let power = exponent;
  while (power > 0) {
    if (power & 1) result = (result * value) % P;
    value = (value * value) % P;
    power >>= 1;
  }
  return result;
}

const STEPS = ["Setup", "Commit", "Challenge", "Response", "Verify"];

export function ZkSchnorrDemo() {
  const [secret, setSecret] = useState(7);
  const [nonce, setNonce] = useState(5);
  const [challenge, setChallenge] = useState(3);
  const [cheat, setCheat] = useState(false);
  const [step, setStep] = useState(0);

  const values = useMemo(() => {
    const publicY = powMod(G, secret);
    const commitment = powMod(G, nonce);
    const response = (nonce + challenge * secret + (cheat ? 1 : 0)) % Q;
    const left = powMod(G, response);
    const right = (commitment * powMod(publicY, challenge)) % P;
    return { publicY, commitment, response, left, right, valid: left === right };
  }, [challenge, cheat, nonce, secret]);

  function reset() {
    setStep(0);
    setCheat(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy">
          <EyeOff className="h-4 w-4 text-brand-600" /> Schnorr proof of knowledge · toy group
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setStep((value) => Math.min(4, value + 1))} className="btn-primary px-3 py-1.5 text-[10px]">Next step</button>
          <button type="button" onClick={reset} className="btn-ghost px-2.5 py-1.5 text-[10px]"><RotateCcw className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {STEPS.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setStep(index)}
            className={`rounded-xl border px-2 py-2.5 text-left transition ${
              index === step ? "border-brand-300 bg-brand-50" : index < step ? "border-emerald-200 bg-emerald-50" : "border-line bg-white"
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">0{index}</span>
            <p className="text-[11px] font-bold text-navy">{item}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_230px]">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
            Step {step} · {STEPS[step]}
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-[11px] text-body">
            <p>public: p = {P}, g = {G}, q = {Q}</p>
            <p>prover secret: x = {step >= 1 ? secret : "hidden"}</p>
            <p>public key: y = g^x mod p = <span className="font-bold text-navy">{step >= 1 ? values.publicY : "?"}</span></p>
            <p>commitment: t = g^r mod p = <span className="font-bold text-navy">{step >= 2 ? values.commitment : "?"}</span></p>
            <p>challenge: c = <span className="font-bold text-navy">{step >= 3 ? challenge : "?"}</span></p>
            <p>response: s = r + c·x mod q = <span className="font-bold text-navy">{step >= 4 ? values.response : "?"}</span></p>
          </div>
          <div className={`mt-3 rounded-lg border p-2 text-[10px] leading-4 ${values.valid ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
            Verify: g^s mod p = {values.left} · t · y^c mod p = {values.right} → {values.valid ? "accept" : "reject"}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block rounded-lg border border-line bg-white p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">secret x</span>
            <input type="range" min={1} max={Q - 1} value={secret} onChange={(event) => { setSecret(Number(event.target.value)); setStep(0); }} className="lab-range mt-1.5" aria-label="Secret exponent" />
            <span className="mt-1 block font-mono text-[10px] text-body">{secret}</span>
          </label>
          <label className="block rounded-lg border border-line bg-white p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">nonce r</span>
            <input type="range" min={1} max={Q - 1} value={nonce} onChange={(event) => { setNonce(Number(event.target.value)); setStep(0); }} className="lab-range mt-1.5" aria-label="Nonce" />
            <span className="mt-1 block font-mono text-[10px] text-body">{nonce}</span>
          </label>
          <label className="block rounded-lg border border-line bg-white p-2.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">challenge c</span>
            <input type="range" min={0} max={Q - 1} value={challenge} onChange={(event) => { setChallenge(Number(event.target.value)); setStep(0); }} className="lab-range mt-1.5" aria-label="Challenge" />
            <span className="mt-1 block font-mono text-[10px] text-body">{challenge}</span>
          </label>
          <button type="button" onClick={() => { setCheat((value) => !value); setStep(0); }} aria-pressed={cheat} className={`w-full rounded-lg border px-2.5 py-2 text-[10px] font-semibold ${cheat ? "border-rose-300 bg-rose-50 text-rose-700" : "border-line bg-white text-body"}`}>
            {cheat ? "Malicious response enabled" : "Simulate cheating prover"}
          </button>
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${values.valid ? "border-brand-200 bg-brand-50 text-brand-900" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
        {values.valid ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>
          {values.valid
            ? "The verifier learns that the prover knows x, without learning x. A simulator can produce transcripts with the same distribution by choosing c and s first and solving for t."
            : "A cheating prover cannot answer two different challenges from the same commitment. The toy modulus is insecure; real systems use large prime-order groups or SNARKs."}
        </span>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-muted">
        <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /> In practice the challenge is derived by hashing the commitment and message (Fiat–Shamir), turning the interactive proof into a signature.
      </p>
    </div>
  );
}
