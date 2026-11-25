"use client";

import { useMemo, useState } from "react";
import type { LabEngine } from "@/lib/wasm/pqcLab";

const Q = 3329;

function centred(value: number): number {
  return value > Q / 2 ? value - Q : value;
}

export function CompressionLab({ engine }: { engine: LabEngine }) {
  const [d, setD] = useState(10);
  const [seed, setSeed] = useState(11);

  const result = useMemo(() => {
    engine.seed(seed);
    const original = engine.read("a");
    engine.write("out", original);
    engine.compress("out", d);
    const compressed = engine.read("out");
    engine.decompress("out", d);
    const recovered = engine.read("out");
    const errors = original.map((value, index) => centred(recovered[index] - value));
    const abs = errors.map(Math.abs);
    const max = Math.max(...abs);
    const mean = abs.reduce((sum, value) => sum + value, 0) / abs.length;
    const atRisk = abs.filter((value) => value > Q / 4).length;
    return { original, compressed, recovered, errors, max, mean, atRisk };
  }, [engine, seed, d]);

  const histogram = useMemo(() => {
    const bins = 17;
    const limit = Math.max(1, result.max);
    const counts = Array<number>(bins).fill(0);
    for (const error of result.errors) {
      const index = Math.min(bins - 1, Math.floor(((error + limit) / (2 * limit)) * bins));
      counts[index] += 1;
    }
    return { counts, limit, maxCount: Math.max(1, ...counts) };
  }, [result]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">compression d</span>
          <input
            type="range"
            min={1}
            max={12}
            value={d}
            onChange={(event) => setD(Number(event.target.value))}
            className="lab-range w-44"
            aria-label="Compression bits"
          />
          <span className="font-mono text-xs text-cyber-cyan">{d} bits</span>
        </label>
        <button type="button" onClick={() => setSeed((value) => value + 1)} className="btn-ghost px-3 py-1.5 text-[10px]">
          New polynomial
        </button>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          saves {(d / 8).toFixed(2)} B / coefficient vs 16-bit storage
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">max |error|</p>
          <p className={`mt-1 font-mono text-xl ${result.max > Q / 4 ? "text-cyber-rose" : "text-emerald-300"}`}>{result.max}</p>
        </div>
        <div className="rounded-lg border border-line bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">mean |error|</p>
          <p className="mt-1 font-mono text-xl text-slate-200">{result.mean.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-line bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">beyond q/4</p>
          <p className={`mt-1 font-mono text-xl ${result.atRisk > 0 ? "text-cyber-rose" : "text-slate-200"}`}>
            {result.atRisk} <span className="text-xs text-slate-500">/ {engine.n}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-ink-950/50 p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            rounding-error distribution
          </span>
          <span className="font-mono text-[9px] text-slate-600">range ±{histogram.limit}</span>
        </div>
        <svg viewBox="0 0 512 110" className="mt-2 h-28 w-full" role="img" aria-label="Histogram of compression rounding error">
          <line x1="0" y1="96" x2="512" y2="96" stroke="rgba(139,136,163,0.3)" />
          {histogram.counts.map((count, index) => {
            const width = 512 / histogram.counts.length;
            const height = (count / histogram.maxCount) * 76;
            return (
              <rect
                key={index}
                x={index * width + 1}
                y={96 - height}
                width={width - 2}
                height={height}
                rx="1"
                className="fill-cyber-cyan/60"
              />
            );
          })}
        </svg>
        <div className="flex justify-between font-mono text-[9px] text-slate-600">
          <span>−{histogram.limit}</span>
          <span>0</span>
          <span>+{histogram.limit}</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line" role="region" aria-label="Scrollable data table" tabIndex={0}>
        <table className="cyber-table cyber-table--dense w-full min-w-[560px] text-left font-mono text-[11px]">
          <thead className="bg-mist-100 uppercase tracking-[0.1em] text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2">i</th>
              <th scope="col" className="px-3 py-2">original</th>
              <th scope="col" className="px-3 py-2">compress</th>
              <th scope="col" className="px-3 py-2">recovered</th>
              <th scope="col" className="px-3 py-2">centred error</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="border-t border-line/75 text-slate-300">
                <td className="px-3 py-1.5 text-slate-600">{index}</td>
                <td className="px-3 py-1.5">{result.original[index]}</td>
                <td className="px-3 py-1.5 text-cyber-violet">{result.compressed[index]}</td>
                <td className="px-3 py-1.5">{result.recovered[index]}</td>
                <td className={`px-3 py-1.5 ${result.errors[index] === 0 ? "text-slate-500" : "text-cyber-amber"}`}>
                  {result.errors[index] > 0 ? "+" : ""}{result.errors[index]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        ML-KEM compresses the vector component with d = 10 and the message polynomial with d = 4. Parameter
        selection keeps the noise strictly inside the reconciliation regions; the resulting decapsulation
        failure probability is below 2⁻¹³⁸ for ML-KEM-768.
      </p>
    </div>
  );
}
