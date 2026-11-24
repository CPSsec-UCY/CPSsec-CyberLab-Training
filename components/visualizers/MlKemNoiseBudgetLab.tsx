"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const Q = 3329;
const HALF = Math.floor(Q / 2);
const QUARTER = Q / 4;

interface NoiseCase {
  bit: number;
  secretNoise: number;
  errorNoise: number;
  d: number;
}

const CASES: NoiseCase[] = [
  { bit: 0, secretNoise: 0, errorNoise: 0, d: 10 },
  { bit: 1, secretNoise: 180, errorNoise: 220, d: 4 },
  { bit: 1, secretNoise: 420, errorNoise: 390, d: 2 },
  { bit: 0, secretNoise: 900, errorNoise: 0, d: 4 },
  { bit: 1, secretNoise: 700, errorNoise: 500, d: 1 },
  { bit: 1, secretNoise: 0, errorNoise: 0, d: 6 },
];

function modQ(value: number): number {
  return ((value % Q) + Q) % Q;
}

function centred(value: number): number {
  const residue = modQ(value);
  return residue > HALF ? residue - Q : residue;
}

function compress(value: number, d: number): number {
  const scale = 2 ** d;
  return Math.floor((value * scale + HALF) / Q) % scale;
}

function decompress(value: number, d: number): number {
  const scale = 2 ** d;
  return Math.floor((value * Q + 2 ** (d - 1)) / scale);
}

function decodeBit(value: number): number {
  return Math.floor((value * 2 + HALF) / Q) % 2;
}

export function MlKemNoiseBudgetLab() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [bit, setBit] = useState(CASES[0].bit);
  const [secretNoise, setSecretNoise] = useState(CASES[0].secretNoise);
  const [errorNoise, setErrorNoise] = useState(CASES[0].errorNoise);
  const [d, setD] = useState(CASES[0].d);

  const result = useMemo(() => {
    const mu = bit === 1 ? Math.round(Q / 2) : 0;
    const v = modQ(mu + secretNoise + errorNoise);
    const compressed = compress(v, d);
    const rounded = decompress(compressed, d);
    const decoded = decodeBit(rounded);
    const roundingContribution = centred(rounded - v);
    const disturbance = centred(rounded - mu);
    const margin = QUARTER - Math.abs(disturbance);
    const pass = decoded === bit && Math.abs(disturbance) < QUARTER;
    const disturbanceBudget = secretNoise + errorNoise + Q / 2 ** (d + 1);
    const toyFailure = Math.max(0, Math.min(1, 1 - QUARTER / Math.max(QUARTER, disturbanceBudget)));
    return { mu, v, compressed, rounded, decoded, roundingContribution, disturbance, margin, pass, toyFailure };
  }, [bit, secretNoise, errorNoise, d]);

  function applyCase(index: number) {
    const next = CASES[index];
    setCaseIndex(index);
    setBit(next.bit);
    setSecretNoise(next.secretNoise);
    setErrorNoise(next.errorNoise);
    setD(next.d);
  }

  function reset() {
    applyCase(0);
  }

  const markerX = (value: number) => 40 + (value / Q) * 640;
  const boundaryOne = markerX(QUARTER);
  const boundaryTwo = markerX(3 * QUARTER);

  return (
    <VisualizerShell
      title="ML-KEM noise-budget explorer"
      description="Accumulate two toy disturbances, compress one coefficient and inspect its remaining reconciliation margin with q = 3329."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label="Message bit">
            {[0, 1].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={bit === value}
                onClick={() => { setBit(value); setCaseIndex(-1); }}
                className={`h-8 px-3 font-mono text-[10px] font-bold ${bit === value ? "bg-brand-50 text-brand-700" : "bg-white text-muted"}`}
              >
                m = {value}
              </button>
            ))}
          </div>
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Compression d
            <select
              value={d}
              onChange={(event) => { setD(Number(event.target.value)); setCaseIndex(-1); }}
              className="mt-1 block h-8 rounded-lg border border-line bg-white px-2 font-mono text-xs text-navy"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>d = {value}</option>)}
            </select>
          </label>
          <StepButton active={false} done={caseIndex > 0} onClick={() => applyCase((caseIndex + 1) % CASES.length)}>
            Next case
          </StepButton>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Toy probabilities are not the standard&apos;s proof.</strong> The estimate uses a crude uniform disturbance budget and one coefficient. FIPS 203 analyses centered binomial noise, products, compression and a union over all coefficients; changing d or the noise model invalidates its standardized bounds.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="rounded-xl border border-line bg-mist-50 p-4">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Secret disturbance <span className="font-mono text-sm text-brand-700">+{secretNoise}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1400}
            step={10}
            value={secretNoise}
            onChange={(event) => { setSecretNoise(Number(event.target.value)); setCaseIndex(-1); }}
            className="lab-range mt-4"
            aria-label="Secret noise magnitude"
          />
          <span className="mt-2 block text-[11px] leading-5 text-body">Stands in for a secret-dependent contribution that must remain small.</span>
        </label>
        <label className="rounded-xl border border-line bg-mist-50 p-4">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Error disturbance <span className="font-mono text-sm text-coral-600">+{errorNoise}</span>
          </span>
          <input
            type="range"
            min={0}
            max={1400}
            step={10}
            value={errorNoise}
            onChange={(event) => { setErrorNoise(Number(event.target.value)); setCaseIndex(-1); }}
            className="lab-range mt-4"
            aria-label="Error noise magnitude"
          />
          <span className="mt-2 block text-[11px] leading-5 text-body">Stands in for encryption error and the other bounded noise terms.</span>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Message codeword μ" value={result.mu} />
        <Metric label="Noisy v" value={result.v} tone="gold" />
        <Metric label="Rounding contribution" value={`${result.roundingContribution >= 0 ? "+" : ""}${result.roundingContribution}`} tone="coral" />
        <Metric label="Margin to q/4" value={result.margin.toFixed(1)} tone={result.pass ? "teal" : "rose"} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-mist-50 p-3">
        <svg viewBox="0 0 720 170" className="min-w-[640px]" role="img" aria-label={`Reconciliation number line. Noisy value ${result.v}, rounded value ${result.rounded}, margin ${result.margin.toFixed(1)}.`}>
          <rect x="40" y="55" width={boundaryOne - 40} height="34" rx="4" fill="#ECFDF5" stroke="#A7F3D0" />
          <rect x={boundaryOne} y="55" width={boundaryTwo - boundaryOne} height="34" rx="4" fill="#F3F0FF" stroke="#D8CDFF" />
          <rect x={boundaryTwo} y="55" width={680 - boundaryTwo} height="34" rx="4" fill="#ECFDF5" stroke="#A7F3D0" />
          <text x={boundaryOne / 2 + 20} y="45" textAnchor="middle" fill="#047857" fontSize="10" fontFamily="monospace">decode 0</text>
          <text x={(boundaryOne + boundaryTwo) / 2} y="45" textAnchor="middle" fill="#5B3DD8" fontSize="10" fontFamily="monospace">decode 1</text>
          <text x={(boundaryTwo + 680) / 2} y="45" textAnchor="middle" fill="#047857" fontSize="10" fontFamily="monospace">decode 0</text>
          {[boundaryOne, boundaryTwo].map((x) => (
            <line key={x} x1={x} y1="50" x2={x} y2="98" stroke="#E25545" strokeWidth="1.5" strokeDasharray="4 3" />
          ))}
          <line x1="40" y1="89" x2="680" y2="89" stroke="#8B88A3" />
          {[0, QUARTER, Q / 2, 3 * QUARTER, Q].map((tick) => (
            <g key={tick}>
              <line x1={markerX(tick)} y1="89" x2={markerX(tick)} y2="97" stroke="#8B88A3" />
              <text x={markerX(tick)} y="114" textAnchor="middle" fill="#6F6B85" fontSize="9" fontFamily="monospace">{Math.round(tick)}</text>
            </g>
          ))}
          <line x1={markerX(result.v)} y1="62" x2={markerX(result.v)} y2="83" stroke="#C97F0E" strokeWidth="3" />
          <line x1={markerX(result.rounded)} y1="62" x2={markerX(result.rounded)} y2="83" stroke="#5B3DD8" strokeWidth="2" />
          <text x={markerX(result.v)} y="137" textAnchor="middle" fill="#C97F0E" fontSize="10" fontFamily="monospace">v = {result.v}</text>
          <text x={markerX(result.rounded)} y="153" textAnchor="middle" fill="#5B3DD8" fontSize="10" fontFamily="monospace">v′ = {result.rounded}</text>
        </svg>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Contributions into v</h4>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-sm text-navy">
            v = {result.mu} + {secretNoise} + {errorNoise} = {result.mu + secretNoise + errorNoise} → {result.v} mod {Q}
          </p>
          <p className="mt-3 font-mono text-xs text-body">
            Compress₍{d}₎(v) = {result.compressed} · Decompress₍{d}₎ = {result.rounded}
          </p>
          <p className="mt-2 font-mono text-xs text-body">
            Decode₁(v′) = {result.decoded} · expected {bit} · disturbance = {result.disturbance}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4" aria-live="polite">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Estimated toy outcome</h4>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${result.pass ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {result.pass ? "no failure in this sample" : "failure in this sample"}
            </span>
            <span className="font-mono text-sm font-bold text-navy">{(result.toyFailure * 100).toFixed(1)}%</span>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-body">
            The percentage is a deliberately rough uniform-tail estimate, not an ML-KEM probability. The live sample is deterministic; only the standardized noise analysis supports the bounds below.
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line" role="region" aria-label="Scrollable data table" tabIndex={0}>
        <table className="w-full min-w-[600px] text-left text-xs">
          <caption className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-[0.1em] text-muted">FIPS 203 decapsulation failure bounds</caption>
          <thead className="bg-mist-100 text-[9px] uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="px-3 py-2">Parameter set</th>
              <th className="px-3 py-2">Rank k</th>
              <th className="px-3 py-2">d_u / d_v</th>
              <th className="px-3 py-2">Failure bound</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono">
            <tr><td className="px-3 py-2 text-navy">ML-KEM-512</td><td className="px-3 py-2">2</td><td className="px-3 py-2">10 / 4</td><td className="px-3 py-2 text-brand-700">2⁻¹³⁸·⁸</td></tr>
            <tr><td className="px-3 py-2 text-navy">ML-KEM-768</td><td className="px-3 py-2">3</td><td className="px-3 py-2">10 / 4</td><td className="px-3 py-2 text-brand-700">2⁻¹⁶⁴·⁸</td></tr>
            <tr><td className="px-3 py-2 text-navy">ML-KEM-1024</td><td className="px-3 py-2">4</td><td className="px-3 py-2">11 / 5</td><td className="px-3 py-2 text-brand-700">2⁻¹⁷⁴·⁸</td></tr>
          </tbody>
        </table>
      </div>
    </VisualizerShell>
  );
}
