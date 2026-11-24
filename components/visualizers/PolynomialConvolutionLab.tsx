"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const Q = 17;
const N = 4;
const PSI = 2;
const OMEGA = 4;

function mod(value: number): number {
  return ((value % Q) + Q) % Q;
}

function powMod(base: number, exponent: number): number {
  let result = 1;
  let factor = mod(base);
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = mod(result * factor);
    factor = mod(factor * factor);
    power = Math.floor(power / 2);
  }
  return result;
}

function evaluate(coefficients: number[], roots: number[]): number[] {
  return roots.map((root) => mod(coefficients.reduce((total, coefficient, index) => total + coefficient * powMod(root, index), 0)));
}

function interpolate(values: number[], roots: number[]): number[] {
  const inverseN = powMod(N, Q - 2);
  return Array.from({ length: N }, (_, degree) => {
    const sum = values.reduce((total, value, index) => {
      const inversePower = powMod(powMod(roots[index], degree), Q - 2);
      return total + value * inversePower;
    }, 0);
    return mod(inverseN * sum);
  });
}

function CoefficientInputs({ label, values, onChange }: { label: string; values: number[]; onChange: (index: number, value: number) => void }) {
  return (
    <fieldset className="rounded-xl border border-line bg-mist-50 p-3">
      <legend className="px-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Polynomial {label}</legend>
      <div className="grid grid-cols-4 gap-2">
        {values.map((value, index) => (
          <label key={index} className="text-center font-mono text-[10px] text-muted">
            {label}{index}
            <input
              type="number"
              min={0}
              max={Q - 1}
              value={value}
              onChange={(event) => onChange(index, Number(event.target.value))}
              className="mt-1 block h-9 w-full rounded-lg border border-line bg-white px-1 text-center font-mono text-xs text-navy"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PolynomialConvolutionLab() {
  const [a, setA] = useState([1, 2, 3, 4]);
  const [b, setB] = useState([1, 2, 3, 4]);
  const [mode, setMode] = useState<"cyclic" | "negacyclic">("negacyclic");
  const [step, setStep] = useState(0);

  const result = useMemo(() => {
    const naive = Array.from({ length: 2 * N - 1 }, () => 0);
    let products = 0;
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        naive[i + j] += a[i] * b[j];
        products += 1;
      }
    }
    const roots = mode === "negacyclic"
      ? Array.from({ length: N }, (_, index) => powMod(PSI, 2 * index + 1))
      : Array.from({ length: N }, (_, index) => powMod(OMEGA, index));
    const aHat = evaluate(a, roots);
    const bHat = evaluate(b, roots);
    const pointwise = aHat.map((value, index) => mod(value * bHat[index]));
    const inverse = interpolate(pointwise, roots);
    const final = Array.from({ length: N }, (_, index) =>
      mod(naive[index] + (mode === "negacyclic" ? -1 : 1) * (naive[index + N] ?? 0)),
    );
    return { naive, roots, aHat, bHat, pointwise, inverse, final, products };
  }, [a, b, mode]);

  function updateCoefficients(setter: React.Dispatch<React.SetStateAction<number[]>>, index: number, value: number) {
    const next = Number.isFinite(value) ? Math.max(0, Math.min(Q - 1, Math.round(value))) : 0;
    setter((current) => current.map((entry, position) => position === index ? next : entry));
    setStep(0);
  }

  function reset() {
    setA([1, 2, 3, 4]);
    setB([1, 2, 3, 4]);
    setMode("negacyclic");
    setStep(0);
  }

  const matches = result.final.every((value, index) => value === result.inverse[index]);
  const labels = ["Naive convolution", "Wrap and reduce", "Transform and multiply", "Compare exact outputs"];

  return (
    <VisualizerShell
      title="Four-coefficient convolution bench"
      description="Edit both polynomials and compare schoolbook multiplication with a direct toy four-point transform modulo 17."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label="Polynomial ring relation">
            {(["cyclic", "negacyclic"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => { setMode(value); setStep(0); }}
                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] ${mode === value ? "bg-brand-50 text-brand-700" : "bg-white text-muted hover:text-brand-700"}`}
              >
                {value}
              </button>
            ))}
          </div>
          <StepButton active={step === 3} done={step > 0} onClick={() => setStep((value) => Math.min(3, value + 1))}>
            {step === 3 ? "Complete" : "Next stage"}
          </StepButton>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Exact toy arithmetic:</strong> q = 17, n = 4. Cyclic reduction uses X⁴ = 1; negacyclic reduction uses X⁴ = −1. The transform view evaluates directly at four roots, so its 4 point-wise products do not include transform work.
        </p>
      }
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <CoefficientInputs label="A" values={a} onChange={(index, value) => updateCoefficients(setA, index, value)} />
        <CoefficientInputs label="B" values={b} onChange={(index, value) => updateCoefficients(setB, index, value)} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Schoolbook products" value={result.products} />
        <Metric label="NTT point-wise products" value={N} tone="teal" />
        <Metric label="Ring" value={mode === "negacyclic" ? "X⁴ = −1" : "X⁴ = 1"} tone="gold" />
      </div>

      <div className="mt-4 rounded-xl border border-line bg-mist-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] font-bold text-brand-700">stage {step + 1} / 4 · {labels[step]}</p>
          <span className="font-mono text-[10px] text-muted">A = [{a.join(", ")}] · B = [{b.join(", ")}]</span>
        </div>
        <div className="mt-3 flex gap-1" aria-hidden="true">
          {labels.map((label, index) => <span key={label} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-brand-500" : "bg-line"}`} />)}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">1 · Naive convolution</h4>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-sm text-navy">raw = [{result.naive.join(", ")}]</p>
          <p className="mt-2 text-[11px] leading-5 text-body">Seven coefficients before ring reduction. Each of the 16 coefficient pairs contributes once.</p>
        </section>

        <section className={`rounded-xl border bg-white p-4 ${step >= 1 ? "border-line" : "border-dashed opacity-50"}`}>
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">2 · Degree wrap</h4>
          {step >= 1 ? (
            <div className="mt-3 space-y-2 font-mono text-[11px] text-body">
              {[4, 5, 6].map((degree) => (
                <div key={degree} className="flex items-center justify-between gap-3 rounded-lg bg-mist-50 px-3 py-2">
                  <span>X^{degree}</span>
                  <span className={mode === "negacyclic" ? "text-coral-600" : "text-emerald-700"}>
                    → {mode === "negacyclic" ? "−" : "+"}X^{degree - 4}
                  </span>
                  <span>{result.naive[degree]}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-3 text-xs text-muted">Press Next stage to wrap degrees 4–6.</p>}
        </section>
      </div>

      <section className={`mt-4 rounded-xl border bg-white p-4 ${step >= 2 ? "border-line" : "border-dashed opacity-50"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">3 · Toy NTT-domain view</h4>
          <span className="font-mono text-[10px] text-muted">{mode === "negacyclic" ? `ψ = ${PSI}, odd powers` : `ω = ${OMEGA}, all powers`}</span>
        </div>
        {step >= 2 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-center font-mono text-xs">
              <caption className="sr-only">Four-point transform values and point-wise products</caption>
              <thead className="text-[9px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-2 py-2">k</th>
                  <th className="px-2 py-2">root</th>
                  <th className="px-2 py-2">Â[k]</th>
                  <th className="px-2 py-2">B̂[k]</th>
                  <th className="px-2 py-2">Ĉ[k] = Â·B̂</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.roots.map((root, index) => (
                  <tr key={index}>
                    <td className="px-2 py-2 text-muted">{index}</td>
                    <td className="px-2 py-2 text-body">{root}</td>
                    <td className="px-2 py-2 text-brand-700">{result.aHat[index]}</td>
                    <td className="px-2 py-2 text-brand-700">{result.bHat[index]}</td>
                    <td className="px-2 py-2 font-bold text-navy">{result.pointwise[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-mono text-[11px] text-body">inverse NTT = [{result.inverse.join(", ")}]</p>
          </div>
        ) : <p className="mt-3 text-xs text-muted">Press Next stage to evaluate, multiply point-wise and interpolate.</p>}
      </section>

      <section className={`mt-4 rounded-xl border bg-white p-4 ${step >= 1 ? "border-line" : "border-dashed opacity-50"}`} aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">4 · Final coefficient array</h4>
          {step >= 1 ? (
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${matches ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {matches ? "schoolbook = NTT" : "mismatch"}
            </span>
          ) : null}
        </div>
        {step >= 1 ? (
          <>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {result.final.map((value, index) => (
                <div key={index} className="rounded-lg border border-line bg-mist-50 p-3 text-center">
                  <p className="font-mono text-[9px] text-muted">c{index}</p>
                  <p className="mt-1 font-mono text-lg font-bold text-navy">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-xs text-body">
              c = [{result.final.join(", ")}] mod {Q}
            </p>
          </>
        ) : <p className="mt-3 text-xs text-muted">The reduced array appears after the wrap stage.</p>}
      </section>
    </VisualizerShell>
  );
}
