"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const Q = 17;
const ALPHA = 4;
const GAMMA = 4;
const T1 = 1;
const A = 1;
const Y = 5;
const S1 = 5;

interface HintCase {
  t0: number;
  z: number;
  c: number;
  malformed: boolean;
}

const CASES: HintCase[] = [
  { t0: 1, z: 10, c: 1, malformed: false },
  { t0: 1, z: 9, c: 1, malformed: false },
  { t0: 1, z: 15, c: 2, malformed: false },
  { t0: 1, z: 10, c: 1, malformed: true },
  { t0: 3, z: 10, c: 1, malformed: false },
];

function mod(value: number, modulus = Q): number {
  return ((value % modulus) + modulus) % modulus;
}

function centred(value: number): number {
  const residue = mod(value);
  return residue > Q / 2 ? residue - Q : residue;
}

function decompose(value: number): { high: number; low: number } {
  const residue = mod(value);
  const high = Math.floor((residue + ALPHA / 2) / ALPHA) % GAMMA;
  const low = centred(residue - high * ALPHA);
  return { high, low };
}

export function MlDsaHintLab() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [t0, setT0] = useState(CASES[0].t0);
  const [z, setZ] = useState(CASES[0].z);
  const [c, setC] = useState(CASES[0].c);
  const [malformed, setMalformed] = useState(CASES[0].malformed);

  const result = useMemo(() => {
    const t = T1 * ALPHA + t0;
    const s2 = mod(t - A * S1);
    const w = mod(A * Y);
    const wHigh = decompose(w).high;
    const expectedZ = mod(Y + c * S1);
    const wPrime = mod(A * z - c * T1 * ALPHA);
    const base = decompose(wPrime);
    const hint = mod(wHigh - base.high, GAMMA);
    const usedHint = malformed ? mod(hint + 1, GAMMA) : hint;
    const correctedHigh = mod(base.high + usedHint, GAMMA);
    const challengeMatches = mod(c, GAMMA) === correctedHigh;
    const accept = challengeMatches && !malformed;
    return { t, s2, w, wHigh, expectedZ, wPrime, base, hint, usedHint, correctedHigh, challengeMatches, accept };
  }, [t0, z, c, malformed]);

  function applyCase(index: number) {
    const next = CASES[index];
    setCaseIndex(index);
    setT0(next.t0);
    setZ(next.z);
    setC(next.c);
    setMalformed(next.malformed);
  }

  function reset() {
    applyCase(0);
  }

  const reason = malformed
    ? "Malformed hint correction"
    : !result.challengeMatches
      ? "Challenge does not match recovered high bits"
      : "Hint and challenge checks pass";

  return (
    <VisualizerShell
      title="High/low decomposition and hint recovery"
      description="A scalar toy map of ML-DSA verification: public high bits, one secret low part, a correction hint and a challenge comparison."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Secret low t₀
            <input
              type="number"
              min={0}
              max={ALPHA - 1}
              value={t0}
              onChange={(event) => { setT0(Math.max(0, Math.min(ALPHA - 1, Math.round(Number(event.target.value) || 0)))); setCaseIndex(-1); }}
              className="mt-1 block h-8 w-16 rounded-lg border border-line bg-white px-2 text-center font-mono text-xs text-navy"
            />
          </label>
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Candidate z
            <input
              type="number"
              min={0}
              max={Q - 1}
              value={z}
              onChange={(event) => { setZ(Math.max(0, Math.min(Q - 1, Math.round(Number(event.target.value) || 0)))); setCaseIndex(-1); }}
              className="mt-1 block h-8 w-16 rounded-lg border border-line bg-white px-2 text-center font-mono text-xs text-navy"
            />
          </label>
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Challenge c
            <select
              value={c}
              onChange={(event) => { setC(Number(event.target.value)); setCaseIndex(-1); }}
              className="mt-1 block h-8 rounded-lg border border-line bg-white px-2 font-mono text-xs text-navy"
            >
              {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <StepButton active={false} done={caseIndex > 0} onClick={() => applyCase((caseIndex + 1) % CASES.length)}>
            Next case
          </StepButton>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Rejection sampling is still required.</strong> This toy accept/reject covers only the rounding-hint relation. ML-DSA also rejects candidates outside the centered norm bound, enforces hint weight and canonical encodings, and resamples; verification alone cannot detect nonce reuse.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-mist-50 p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Public-key decomposition</h4>
          <p className="mt-3 font-mono text-sm text-navy">t = t₁·2ᵈ + t₀ = {T1}·{ALPHA} + {t0} = {result.t}</p>
          <p className="mt-2 font-mono text-xs text-body">Public t₁ = {T1} · secret t₀ = {t0} · implied toy s₂ = {result.s2}</p>
          <p className="mt-2 text-[11px] leading-5 text-body">The verifier sees t₁ but not t₀. The hint supplies only the rounding correction needed to recover the hashed high bits.</p>
        </section>
        <section className="rounded-xl border border-line bg-mist-50 p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Signer-side reference</h4>
          <p className="mt-3 font-mono text-sm text-navy">w = Ay = {A}·{Y} = {result.w} mod {Q}</p>
          <p className="mt-2 font-mono text-xs text-body">HighBits(w) = {result.wHigh} · expected z = y + cs₁ = {result.expectedZ}</p>
          <p className="mt-2 text-[11px] leading-5 text-body">A different candidate z changes w′. The hint is recomputed here as a teaching aid; a real signer constructs it from the actual low-bit relation.</p>
        </section>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white p-4">
        <input
          type="checkbox"
          checked={malformed}
          onChange={(event) => { setMalformed(event.target.checked); setCaseIndex(-1); }}
          className="h-4 w-4 accent-brand-600"
        />
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Toggle malformed hint</span>
          <span className="mt-1 block text-[11px] text-body">Adds one to the correction bit, modelling an inconsistent hint that the verifier must reject.</span>
        </span>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Verifier w′" value={result.wPrime} tone="gold" />
        <Metric label="Base high bits" value={result.base.high} />
        <Metric label="Hint correction h" value={result.usedHint} tone={malformed ? "coral" : "teal"} />
        <Metric label="Recovered high" value={result.correctedHigh} tone={result.accept ? "teal" : "rose"} />
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">1 · Recompute the verifier equation</p>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-sm text-navy">
            w′ = Az − c t₁2ᵈ = {A}·{z} − {c}·{T1}·{ALPHA} = {A * z - c * T1 * ALPHA} → {result.wPrime} mod {Q}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">2 · Decompose and apply the hint</p>
          <p className="mt-3 font-mono text-sm text-navy">
            {result.wPrime} = {ALPHA}·{result.base.high} + ({result.base.low})
          </p>
          <p className="mt-2 font-mono text-xs text-body">
            h = {malformed ? `${result.hint} + 1 (malformed)` : result.hint} · recovered high = ({result.base.high} + {result.usedHint}) mod {GAMMA} = {result.correctedHigh}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">3 · Compare the challenge</p>
            <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${result.accept ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {result.accept ? "accept" : "reject"}
            </span>
          </div>
          <p className="mt-3 font-mono text-sm text-navy">c mod γ = {mod(c, GAMMA)} · recovered high = {result.correctedHigh}</p>
          <p className={`mt-2 text-[11px] leading-5 ${result.accept ? "text-emerald-700" : "text-coral-700"}`}>{reason}.</p>
        </div>
      </div>
    </VisualizerShell>
  );
}
