"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const SECRETS = [0xa7, 0x3c, 0x5e, 0x81];
const PLAINTEXTS = Array.from({ length: 64 }, (_, index) => ((index * 73 + 19) ^ (index >> 1)) & 0xff);
const SAMPLES = 28;
const WINDOW = Array.from({ length: 7 }, (_, index) => index + 9);

function hammingWeight(value: number): number {
  let bits = value & 0xff;
  let weight = 0;
  while (bits > 0) {
    weight += bits & 1;
    bits >>>= 1;
  }
  return weight;
}

function deterministicNoise(trace: number, sample: number, keyIndex: number, masked: boolean): number {
  let value = Math.imul(trace + 101, 0x45d9f3b) ^ Math.imul(sample + 17, 0x27d4eb2d) ^ Math.imul(keyIndex + 29, 0x165667b1);
  if (masked) value ^= 0x9e3779b9;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return ((value >>> 0) / 4294967295) * 2 - 1;
}

function pearson(xs: number[], ys: number[]): number {
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let index = 0; index < xs.length; index += 1) {
    const dx = xs[index] - meanX;
    const dy = ys[index] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  const denominator = Math.sqrt(varianceX * varianceY);
  return denominator === 0 ? 0 : Math.max(-1, Math.min(1, covariance / denominator));
}

export function PowerTraceLab() {
  const [keyIndex, setKeyIndex] = useState(0);
  const [guess, setGuess] = useState(0);
  const [traceCount, setTraceCount] = useState(32);
  const [noise, setNoise] = useState(18);
  const [masked, setMasked] = useState(false);

  const secret = SECRETS[keyIndex];
  const analysis = useMemo(() => {
    const traces = Array.from({ length: traceCount }, (_, trace) =>
      Array.from({ length: SAMPLES }, (_, sample) => {
        const baseline = 5 + ((sample * 3 + trace * 5) % 7) * 0.35;
        const bump = Math.max(0, 1 - Math.abs(sample - 12) / 3);
        const leakage = hammingWeight(PLAINTEXTS[trace] ^ secret);
        const signal = 1.9 * leakage * bump * (masked ? 0.18 : 1);
        const maskWave = masked ? 2.2 * Math.sin((trace + 1) * 1.71 + sample * 0.43) : 0;
        const disturbance = (noise / 12) * deterministicNoise(trace, sample, keyIndex, masked);
        return baseline + signal + maskWave + disturbance;
      }),
    );
    const observed = traces.map((trace) => WINDOW.reduce((sum, sample) => sum + trace[sample], 0) / WINDOW.length);
    const scores = Array.from({ length: 256 }, (_, candidate) => {
      const prediction = PLAINTEXTS.slice(0, traceCount).map((plaintext) => hammingWeight(plaintext ^ candidate));
      return pearson(prediction, observed);
    });
    let bestGuess = 0;
    let runnerUpScore = -1;
    for (let candidate = 0; candidate < scores.length; candidate += 1) {
      if (candidate === secret) continue;
      runnerUpScore = Math.max(runnerUpScore, scores[candidate]);
      if (scores[candidate] > scores[bestGuess]) bestGuess = candidate;
    }
    if (scores[secret] > scores[bestGuess]) bestGuess = secret;
    const correctScore = scores[secret];
    const prominence = correctScore - runnerUpScore;
    const shownCount = Math.min(12, traceCount);
    const shownIndices = Array.from({ length: shownCount }, (_, index) => Math.round(index * (traceCount - 1) / (shownCount - 1)));
    const prediction = PLAINTEXTS.slice(0, traceCount).map((plaintext) => hammingWeight(plaintext ^ guess));
    return { traces, scores, bestGuess, runnerUpScore, correctScore, prominence, shownIndices, prediction };
  }, [secret, traceCount, noise, masked, keyIndex, guess]);

  const currentScore = analysis.scores[guess];
  const standsOut = !masked && analysis.bestGuess === secret && analysis.prominence >= 0.08;
  const status = masked
    ? "masking suppresses the secret-dependent peak"
    : standsOut
      ? "correct guess stands out"
      : traceCount < 16 || noise >= 55
        ? "signal is weak or ambiguous"
        : "keep searching the byte hypotheses";

  function reset() {
    setKeyIndex(0);
    setGuess(0);
    setTraceCount(32);
    setNoise(18);
    setMasked(false);
  }

  function hex(value: number): string {
    return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
  }

  return (
    <VisualizerShell
      title="Deterministic DPA correlation bench"
      description="Guess one key byte, predict Hamming-weight leakage and correlate it with a fixed window of synthetic power traces."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <StepButton
            active={false}
            done={keyIndex > 0}
            onClick={() => { setKeyIndex((value) => (value + 1) % SECRETS.length); setGuess(0); }}
          >
            Next key
          </StepButton>
          <label className="flex cursor-pointer items-center gap-2 text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            <input
              type="checkbox"
              checked={masked}
              onChange={(event) => setMasked(event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Masking
          </label>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Deterministic teaching data:</strong> traces are generated from a Hamming-weight model, not measured hardware. Masking scales the secret-dependent term and adds an independent share waveform. Real DPA needs aligned acquisition, held-out traces, significance controls and higher-order leakage assessment.
        </p>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <label className="rounded-xl border border-line bg-mist-50 p-4">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Guessed key byte <span className="font-mono text-sm text-brand-700">{hex(guess)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={255}
            value={guess}
            onChange={(event) => setGuess(Number(event.target.value))}
            className="lab-range mt-4"
            aria-label="Guessed key byte"
          />
          <span className="mt-2 block font-mono text-[10px] text-muted">0x00 — 0xFF</span>
        </label>
        <label className="rounded-xl border border-line bg-mist-50 p-4">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Number of traces <span className="font-mono text-sm text-brand-700">{traceCount}</span>
          </span>
          <input
            type="range"
            min={8}
            max={64}
            step={4}
            value={traceCount}
            onChange={(event) => setTraceCount(Number(event.target.value))}
            className="lab-range mt-4"
            aria-label="Number of power traces"
          />
          <span className="mt-2 block text-[10px] text-muted">Up to 12 traces are drawn.</span>
        </label>
        <label className="rounded-xl border border-line bg-mist-50 p-4">
          <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Noise <span className="font-mono text-sm text-coral-600">{noise}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
            className="lab-range mt-4"
            aria-label="Power trace noise"
          />
          <span className="mt-2 block text-[10px] text-muted">Deterministic disturbance amplitude.</span>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Guess correlation" value={currentScore.toFixed(3)} tone={currentScore > 0.6 ? "teal" : "brand"} />
        <Metric label="Best hypothesis" value={hex(analysis.bestGuess)} tone="gold" />
        <Metric label="Toy secret byte" value={hex(secret)} tone="coral" />
        <Metric label="Peak prominence" value={analysis.prominence.toFixed(3)} tone={standsOut ? "teal" : "rose"} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-mist-50 p-3">
        <svg viewBox="0 0 720 260" className="min-w-[660px]" role="img" aria-label={`${analysis.shownIndices.length} synthetic power traces. Current guess ${hex(guess)} has correlation ${currentScore.toFixed(3)}. ${status}.`}>
          <line x1="330" y1="8" x2="330" y2="248" stroke="#D8CDFF" strokeDasharray="4 4" />
          <text x="338" y="16" fill="#5B3DD8" fontSize="9" fontFamily="monospace">leakage window</text>
          {analysis.shownIndices.map((traceIndex, row) => {
            const points = analysis.traces[traceIndex].map((value, sample) => {
              const x = 42 + (sample / (SAMPLES - 1)) * 660;
              const y = 30 + row * 19 - value * 1.15;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(" ");
            return (
              <g key={traceIndex}>
                <line x1="34" y1={30 + row * 19} x2="704" y2={30 + row * 19} stroke="#EFECF7" />
                <text x="8" y={34 + row * 19} fill="#8B88A3" fontSize="8" fontFamily="monospace">t{traceIndex + 1}</text>
                <polyline points={points} fill="none" stroke={row % 2 === 0 ? "#6C4DF6" : "#0F9D8A"} strokeWidth="1.4" strokeOpacity="0.78" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Predicted Hamming-weight leakage for {hex(guess)}</h4>
          <div className="mt-4 flex h-24 items-end gap-1.5" aria-label={`Predicted Hamming weights: ${analysis.shownIndices.map((index) => analysis.prediction[index]).join(", ")}`}>
            {analysis.shownIndices.map((traceIndex) => (
              <div key={traceIndex} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="font-mono text-[9px] text-brand-700">{analysis.prediction[traceIndex]}</span>
                <div className="w-full max-w-7 rounded-t bg-brand-200" style={{ height: `${8 + analysis.prediction[traceIndex] * 5}px` }} />
              </div>
            ))}
          </div>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-[10px] text-body">
            P = HW(pᵢ ⊕ {hex(guess)}) = [{analysis.shownIndices.map((index) => analysis.prediction[index]).join(", ")}]
          </p>
        </section>
        <section className="rounded-xl border border-line bg-white p-4" aria-live="polite">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Does the correct guess stand out?</h4>
          <p className={`mt-3 text-sm font-bold ${standsOut ? "text-emerald-700" : "text-rose-700"}`}>{status}.</p>
          <p className="mt-3 font-mono text-xs text-body">
            true-key ρ = {analysis.correctScore.toFixed(3)}<br />
            best wrong ρ = {analysis.runnerUpScore.toFixed(3)}<br />
            shown traces = {analysis.shownIndices.length} / {traceCount}
          </p>
          <p className="mt-3 text-[11px] leading-5 text-body">
            {masked
              ? "The prediction is unchanged, but the observed secret-dependent component is much smaller, so correlation falls toward the noise."
              : "Try the displayed toy secret, then raise noise or lower the trace count to see the peak become ambiguous."}
          </p>
        </section>
      </div>
    </VisualizerShell>
  );
}
