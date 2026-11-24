"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const RAW_GRADIENT = [2.4, -1.8, 0.9, 3.2];
const NOISE_DIRECTION = [0.42, -0.31, 0.18, 0.36];
const RAW_NORM = Math.sqrt(RAW_GRADIENT.reduce((sum, value) => sum + value * value, 0));
const BUDGET = 3;
const DELTA = 0.00001;
const STEPS = ["Clip", "Add Gaussian noise", "Compose rounds"];

function fixed(value: number) {
  return value.toFixed(2);
}

export function DifferentialPrivacyLab() {
  const [clipping, setClipping] = useState(1);
  const [noise, setNoise] = useState(0.8);
  const [rounds, setRounds] = useState(10);
  const [step, setStep] = useState(0);

  const scale = Math.min(1, clipping / RAW_NORM);
  const clipped = RAW_GRADIENT.map((value) => value * scale);
  const sigma = clipping * noise * 0.6;
  const noised = clipped.map((value, index) => value + NOISE_DIRECTION[index] * sigma);
  const clippedNorm = Math.sqrt(clipped.reduce((sum, value) => sum + value * value, 0));
  const epsilonPerRound = Number((0.9 / noise).toFixed(3));
  const epsilonSpent = Number((epsilonPerRound * rounds).toFixed(3));
  const epsilonRemaining = Math.max(0, BUDGET - epsilonSpent);
  const overBudget = epsilonSpent > BUDGET;
  const accuracy = Math.round(
    Math.max(
      42,
      Math.min(93, 92 - 14 * Math.max(0, 1 - clipping / 1.2) - 24 * Math.max(0, noise - 0.4) - 0.015 * (rounds - 1)),
    ),
  );
  const chartMax = Math.max(BUDGET, epsilonPerRound * 50);
  const chartX = (round: number) => 30 + (round / 50) * 270;
  const chartY = (epsilon: number) => 100 - (epsilon / chartMax) * 78;
  const chartPoints = Array.from({ length: 51 }, (_, round) => `${chartX(round)},${chartY(epsilonPerRound * round)}`).join(" ");
  const budgetY = chartY(BUDGET);
  const spentX = chartX(rounds);
  const spentY = chartY(epsilonSpent);

  function reset() {
    setClipping(1);
    setNoise(0.8);
    setRounds(10);
    setStep(0);
  }

  return (
    <VisualizerShell
      title="Clipping, noise and composition workbench"
      description="Toy client-level differential privacy values for one four-coordinate gradient."
      onReset={reset}
      controls={
        <label className="block w-44">
          <span className="flex justify-between text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            <span>Rounds</span><output>{rounds}</output>
          </span>
          <input
            type="range"
            min={1}
            max={50}
            value={rounds}
            onChange={(event) => setRounds(Number(event.target.value))}
            className="lab-range mt-1"
            aria-label="Number of training rounds"
          />
        </label>
      }
      footer={
        <span>
          <strong className="text-navy">Toy model, not a privacy proof.</strong> This workbench uses ε per round = 0.9 / noise multiplier, basic composition and δ = 10⁻⁵. Record-level DP bounds the effect of one example; client-level DP bounds the effect of one client&apos;s entire contribution and is usually the relevant claim for a hospital update. They are not interchangeable. Production systems need a stated neighbouring relation, validated sensitivity analysis, a standard Gaussian calibration and a persistent privacy accountant.
        </span>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block rounded-xl border border-line bg-mist-50 p-3">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            <span>Clipping norm C</span><output className="font-mono text-brand-700">{clipping.toFixed(1)}</output>
          </span>
          <input
            type="range"
            min={0.2}
            max={2}
            step={0.1}
            value={clipping}
            onChange={(event) => setClipping(Number(event.target.value))}
            className="lab-range mt-3"
            aria-label="Gradient clipping norm"
          />
          <span className="mt-1 flex justify-between text-[9px] text-muted"><span>0.2 · more distortion</span><span>2.0 · less clipping</span></span>
        </label>
        <label className="block rounded-xl border border-line bg-mist-50 p-3">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            <span>Noise multiplier</span><output className="font-mono text-brand-700">{noise.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min={0.2}
            max={1.6}
            step={0.05}
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
            className="lab-range mt-3"
            aria-label="Gaussian noise multiplier"
          />
          <span className="mt-1 flex justify-between text-[9px] text-muted"><span>0.2 · more utility, more ε</span><span>1.6 · more privacy, less utility</span></span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Differential privacy pipeline">
        {STEPS.map((label, index) => (
          <StepButton key={label} active={step === index} done={index < step} onClick={() => setStep(index)}>
            {label}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-xl border border-line bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Toy gradient vector</p>
            <span className="font-mono text-[9px] text-muted">σ = {fixed(sigma)}</span>
          </div>
          <div className="mt-2 overflow-x-auto" role="region" aria-label="Scrollable data table" tabIndex={0}>
            <table className="w-full text-left text-[10px]">
              <caption className="sr-only">Gradient coordinates before clipping, after clipping and after deterministic illustrative noise</caption>
              <thead className="text-muted">
                <tr>
                  <th className="py-1 pr-2 font-semibold">Coordinate</th>
                  <th className="py-1 pr-2 font-semibold">Raw</th>
                  <th className="py-1 pr-2 font-semibold">Clipped</th>
                  <th className="py-1 font-semibold">Noisy</th>
                </tr>
              </thead>
              <tbody className="font-mono text-navy">
                {RAW_GRADIENT.map((value, index) => (
                  <tr key={index} className="border-t border-line">
                    <td className="py-1.5 pr-2 text-muted">x{index + 1}</td>
                    <td className="py-1.5 pr-2">{fixed(value)}</td>
                    <td className="py-1.5 pr-2 text-brand-700">{fixed(clipped[index])}</td>
                    <td className="py-1.5 text-emerald-700">{fixed(noised[index])}</td>
                  </tr>
                ))}
                <tr className="border-t border-line-strong font-bold">
                  <td className="py-1.5 pr-2 text-muted">L2 norm</td>
                  <td className="py-1.5 pr-2">{fixed(RAW_NORM)}</td>
                  <td className="py-1.5 pr-2 text-brand-700">{fixed(clippedNorm)}</td>
                  <td className="py-1.5 text-emerald-700">{fixed(Math.sqrt(noised.reduce((sum, item) => sum + item * item, 0)))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 rounded-lg border border-line bg-mist-50 p-2.5 text-[10px] leading-4 text-muted" aria-live="polite">
            {step === 0 && `The raw norm ${fixed(RAW_NORM)} is scaled by ${scale.toFixed(3)} to respect C = ${clipping.toFixed(1)}. Clipping bounds sensitivity but also removes useful signal.`}
            {step === 1 && `A fixed illustrative noise direction is scaled by σ = C × multiplier × 0.6. Real Gaussian noise is sampled privately; these values are deterministic for teaching.`}
            {step === 2 && `Each round consumes ε = ${epsilonPerRound.toFixed(3)}. After ${rounds} rounds the toy accountant reports ${epsilonSpent.toFixed(3)} against a total budget of ${BUDGET}.`}
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="ε / round" value={epsilonPerRound.toFixed(3)} tone="gold" />
            <Metric label="ε spent" value={epsilonSpent.toFixed(3)} tone={overBudget ? "rose" : "brand"} />
            <Metric label="ε remaining" value={epsilonRemaining.toFixed(3)} tone={overBudget ? "rose" : "teal"} />
            <Metric label="Toy accuracy" value={`${accuracy}%`} tone={accuracy < 70 ? "coral" : "teal"} />
          </div>
          <div className="rounded-xl border border-line bg-mist-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Basic composition over 50 rounds</p>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${overBudget ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {overBudget ? "budget exceeded" : "within budget"}
              </span>
            </div>
            <svg viewBox="0 0 320 125" className="mt-2 w-full" role="img" aria-label={`Cumulative epsilon reaches ${epsilonSpent.toFixed(3)} after ${rounds} rounds; budget is ${BUDGET}`}>
              <line x1="30" y1="100" x2="300" y2="100" stroke="#D7D2E8" />
              <line x1="30" y1="22" x2="300" y2="22" stroke="#EFECF7" />
              <line x1="30" y1="22" x2="30" y2="100" stroke="#D7D2E8" />
              <line x1="30" y1={budgetY} x2="300" y2={budgetY} stroke="#E25545" strokeDasharray="4 4" />
              <text x="298" y={budgetY - 4} textAnchor="end" fill="#C24134" fontSize="8">budget ε = {BUDGET}</text>
              <polyline points={chartPoints} fill="none" stroke="#6C4DF6" strokeWidth="2" />
              <line x1={spentX} y1={spentY} x2={spentX} y2="100" stroke="#9B7BFA" strokeDasharray="3 3" />
              <circle cx={spentX} cy={spentY} r="4" fill={overBudget ? "#E25545" : "#6C4DF6"} />
              <text x={spentX} y={Math.max(12, spentY - 7)} textAnchor="middle" fill="#5B3DD8" fontSize="8">{epsilonSpent.toFixed(2)}</text>
              <text x="30" y="116" fill="#8B88A3" fontSize="8">0</text>
              <text x="165" y="116" textAnchor="middle" fill="#8B88A3" fontSize="8">25 rounds</text>
              <text x="300" y="116" textAnchor="end" fill="#8B88A3" fontSize="8">50</text>
            </svg>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist-200">
              <div className={`h-full rounded-full ${overBudget ? "bg-rose-500" : "bg-brand-500"}`} style={{ width: `${Math.min(100, (epsilonSpent / BUDGET) * 100)}%` }} />
            </div>
          </div>
          <div className={`flex items-start gap-2 rounded-xl border p-3 text-[10px] leading-4 ${overBudget ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`} aria-live="polite">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {overBudget
                ? `Stop before round ${Math.floor(BUDGET / epsilonPerRound) + 1}: the remaining releases would exceed the toy total budget. Lower ε per round by increasing noise, or reduce the number of releases.`
                : `${Math.floor(epsilonRemaining / epsilonPerRound)} more rounds fit before the toy budget is exhausted. More noise lowers ε here but reduces the illustrative accuracy.`}
            </span>
          </div>
        </div>
      </div>
    </VisualizerShell>
  );
}
