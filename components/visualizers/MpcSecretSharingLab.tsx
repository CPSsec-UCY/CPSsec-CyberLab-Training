"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const Q = 17;
const SHARE_COUNT = 4;

function mod(value: number): number {
  return ((value % Q) + Q) % Q;
}

function modInverse(value: number): number {
  let result = 1;
  let base = mod(value);
  let exponent = Q - 2;
  while (exponent > 0) {
    if (exponent % 2 === 1) result = mod(result * base);
    base = mod(base * base);
    exponent = Math.floor(exponent / 2);
  }
  return result;
}

function interpolateAtZero(points: Array<{ x: number; y: number }>): number {
  return mod(points.reduce((total, point, index) => {
    const basis = points.reduce((product, other, otherIndex) => {
      if (index === otherIndex) return product;
      return mod(product * mod(-other.x) * modInverse(point.x - other.x));
    }, 1);
    return total + point.y * basis;
  }, 0));
}

export function MpcSecretSharingLab() {
  const [secret, setSecret] = useState(7);
  const [threshold, setThreshold] = useState(2);
  const [sharesVisible, setSharesVisible] = useState(false);
  const [corrupted, setCorrupted] = useState(false);

  const result = useMemo(() => {
    const coefficients = Array.from({ length: threshold }, (_, index) =>
      index === 0 ? secret : mod(secret * (2 * index + 1) + index * 3 + threshold),
    );
    const honestShares = Array.from({ length: SHARE_COUNT }, (_, index) => {
      const x = index + 1;
      const y = coefficients.reduce((total, coefficient, power) => total + coefficient * x ** power, 0);
      return { x, y: mod(y) };
    });
    const sharedValues = honestShares.map((share, index) => ({
      ...share,
      y: corrupted && index === 0 ? mod(share.y + 1) : share.y,
    }));
    const reconstructionPoints = sharedValues.slice(0, threshold);
    const recovered = interpolateAtZero(reconstructionPoints);
    return { coefficients, honestShares, sharedValues, reconstructionPoints, recovered };
  }, [secret, threshold, corrupted]);

  const recoveredSecret = result.recovered === secret;
  const polynomial = result.coefficients
    .map((coefficient, index) => index === 0 ? `${coefficient}` : `${coefficient}X${index === 1 ? "" : `^${index}`}`)
    .join(" + ");

  function updateSecret(value: number) {
    setSecret(Number.isFinite(value) ? Math.max(0, Math.min(Q - 1, Math.round(value))) : 0);
    setSharesVisible(false);
    setCorrupted(false);
  }

  function updateThreshold(value: number) {
    setThreshold(value);
    setSharesVisible(false);
    setCorrupted(false);
  }

  function reset() {
    setSecret(7);
    setThreshold(2);
    setSharesVisible(false);
    setCorrupted(false);
  }

  return (
    <VisualizerShell
      title="Toy Shamir sharing over F₁₇"
      description="Four shares, a selectable threshold and one injectable bad value. Every interpolation step uses exact arithmetic modulo 17."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Secret
            <input
              type="number"
              min={0}
              max={Q - 1}
              value={secret}
              onChange={(event) => updateSecret(Number(event.target.value))}
              className="mt-1 block h-8 w-20 rounded-lg border border-line bg-white px-2 text-center font-mono text-xs text-navy"
            />
          </label>
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Threshold
            <select
              value={threshold}
              onChange={(event) => updateThreshold(Number(event.target.value))}
              className="mt-1 block h-8 rounded-lg border border-line bg-white px-2 font-mono text-xs text-navy"
            >
              {[2, 3, 4].map((value) => <option key={value} value={value}>{value}-of-4</option>)}
            </select>
          </label>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Toy model:</strong> a degree-{threshold - 1} polynomial needs {threshold} points. With proper uniformly random coefficients, up to {threshold - 1} shares reveal nothing about the constant term. This tiny field and fixed teaching coefficients are reproducible, not secure.
        </p>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StepButton active={sharesVisible} done={sharesVisible} onClick={() => setSharesVisible((value) => !value)}>
          {sharesVisible ? "Hide shares" : "Reveal shares"}
        </StepButton>
        <StepButton active={corrupted} done={corrupted} onClick={() => setCorrupted((value) => !value)}>
          {corrupted ? "Repair share 1" : "Corrupt share 1"}
        </StepButton>
        <span className="rounded-full border border-line bg-mist-50 px-3 py-1.5 font-mono text-[10px] text-muted">
          q = {Q} · n = {SHARE_COUNT} · degree = {threshold - 1}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Threshold" value={`${threshold} of ${SHARE_COUNT}`} />
        <Metric label="Private share limit" value={threshold - 1} tone="teal" />
        <Metric label="Corrupted share" value={corrupted ? "share 1" : "none"} tone={corrupted ? "coral" : "teal"} />
        <Metric label="Recovered f(0)" value={sharesVisible ? result.recovered : "hidden"} tone={sharesVisible && recoveredSecret ? "teal" : "coral"} />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-mist-50 p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Polynomial</p>
        <p className="mt-2 overflow-x-auto whitespace-nowrap font-mono text-sm text-brand-700">f(X) = {polynomial} mod {Q}</p>
        <p className="mt-2 text-[11px] leading-5 text-body">
          The constant term is the secret. The other {threshold - 1} coefficient{threshold === 2 ? "" : "s"} mask it until enough points are combined.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-left text-xs">
          <caption className="sr-only">Shamir polynomial points and distributed shares</caption>
          <thead className="bg-mist-100 text-[9px] uppercase tracking-[0.1em] text-muted">
            <tr>
              <th className="px-3 py-2">Point x</th>
              <th className="px-3 py-2">Polynomial f(x)</th>
              <th className="px-3 py-2">Shared value</th>
              <th className="px-3 py-2">Use in reconstruction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono">
            {result.sharedValues.map((share, index) => (
              <tr key={share.x} className={index < threshold ? "bg-brand-50/40" : ""}>
                <td className="px-3 py-2 text-navy">x = {share.x}</td>
                <td className="px-3 py-2 text-body">{sharesVisible ? result.honestShares[index].y : "hidden"}</td>
                <td className={`px-3 py-2 ${corrupted && index === 0 ? "text-coral-600" : "text-body"}`}>
                  {sharesVisible ? share.y : "hidden"}{corrupted && index === 0 ? " (bad)" : ""}
                </td>
                <td className="px-3 py-2 text-muted">{index < threshold ? `yes · point ${index + 1}` : "reserve"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-white p-4" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Lagrange reconstruction at x = 0</p>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
            !sharesVisible ? "border-line bg-mist-50 text-muted" : recoveredSecret ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}>
            {!sharesVisible ? "reveal to reconstruct" : recoveredSecret ? "secret recovered" : "wrong secret"}
          </span>
        </div>
        <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-6 text-body">
          {sharesVisible
            ? result.reconstructionPoints.map((point) => `(${point.x}, ${point.y})`).join("  ")
            : `Using the first ${threshold} shares once revealed`}
        </p>
        <p className="mt-2 font-mono text-sm font-bold text-navy">
          {sharesVisible ? `f(0) = ${result.recovered} mod ${Q} · expected ${secret}` : "f(0) = hidden"}
        </p>
        {sharesVisible && !recoveredSecret ? (
          <p className="mt-2 text-[11px] leading-5 text-coral-700">
            One altered point changes the degree-{threshold - 1} interpolant. A real system also needs authenticated shares and consistency checks; interpolation alone does not identify the malicious party.
          </p>
        ) : null}
      </div>
    </VisualizerShell>
  );
}
