"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const Q = 3329;
const HALF = Math.floor(Q / 2);
const QUARTER = Q / 4;

function modQ(value: number): number {
  return ((value % Q) + Q) % Q;
}

function compress(value: number, d: number): number {
  const mod = 2 ** d;
  return Math.floor(((value << d) + HALF) / Q) % mod;
}

function decompress(value: number, d: number): number {
  return Math.floor((value * Q + 2 ** (d - 1)) / 2 ** d);
}

function decodeBit(value: number): number {
  return Math.floor((value * 2 + HALF) / Q) % 2;
}

function centred(value: number): number {
  return value > HALF ? value - Q : value;
}

export function MlKemCorrectness() {
  const [bit, setBit] = useState(0);
  const [noise, setNoise] = useState(0);
  const [d, setD] = useState(4);

  const result = useMemo(() => {
    const mu = bit === 1 ? 1665 : 0;
    const noisy = modQ(mu + noise);
    const compressed = compress(noisy, d);
    const recovered = decompress(compressed, d);
    const decoded = decodeBit(recovered);
    const rounding = centred(recovered - noisy);
    const totalError = centred(recovered - mu);
    return { mu, noisy, compressed, recovered, decoded, rounding, totalError };
  }, [bit, noise, d]);

  const pass = result.decoded === bit;
  const markerX = 48 + (result.noisy / Q) * 624;
  const muX = 48 + (result.mu / Q) * 624;
  const recoveredX = 48 + (result.recovered / Q) * 624;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">message bit</span>
          {[0, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setBit(value)}
              aria-pressed={bit === value}
              className={`h-9 w-9 rounded-lg border font-mono text-sm transition ${
                bit === value
                  ? "border-cyber-cyan/50 bg-cyber-cyan/15 text-cyber-cyan"
                  : "border-white/10 bg-ink-950/50 text-slate-400 hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
          pass ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-cyber-rose/40 bg-cyber-rose/10 text-cyber-rose"
        }`}>
          {pass ? "reconciliation succeeds" : "decoding failure"}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/60 p-3">
        <svg viewBox="0 0 720 170" className="min-w-[620px]" role="img" aria-label="Number-line visualisation of ML-KEM message reconciliation">
          <rect x="48" y="52" width="156" height="34" rx="4" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" />
          <rect x="204" y="52" width="312" height="34" rx="4" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.3)" />
          <rect x="516" y="52" width="156" height="34" rx="4" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" />
          <text x="126" y="43" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="monospace">decodes 0</text>
          <text x="360" y="43" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="monospace">decodes 1</text>
          <text x="594" y="43" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="monospace">decodes 0</text>

          {Array.from({ length: 2 ** Math.min(d, 8) + 1 }).map((_, index) => {
            const x = 48 + (index / 2 ** Math.min(d, 8)) * 624;
            return <line key={index} x1={x} y1="52" x2={x} y2="86" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />;
          })}

          <line x1="48" y1="86" x2="672" y2="86" stroke="rgba(148,163,184,0.35)" strokeWidth="1" />
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line x1={48 + tick * 624} y1="86" x2={48 + tick * 624} y2="94" stroke="rgba(148,163,184,0.5)" />
              <text x={48 + tick * 624} y="110" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                {Math.round(tick * Q)}
              </text>
            </g>
          ))}

          <line x1={muX} y1="58" x2={muX} y2="82" stroke="#a78bfa" strokeWidth="2" strokeDasharray="3 3" />
          <text x={muX} y="132" textAnchor="middle" fill="#a78bfa" fontSize="9" fontFamily="monospace">mu</text>

          <line x1={recoveredX} y1="58" x2={recoveredX} y2="82" stroke="#fbbf24" strokeWidth="1.5" />
          <text x={recoveredX} y="145" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace">v&apos;</text>

          <motion.circle
            cx={markerX}
            cy="69"
            r="6"
            fill={pass ? "#22d3ee" : "#fb7185"}
            stroke="#03060d"
            strokeWidth="2"
            initial={false}
            animate={{ cx: markerX }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
          />
          <text x={markerX} y="20" textAnchor="middle" fill={pass ? "#22d3ee" : "#fb7185"} fontSize="10" fontFamily="monospace">
            v = mu + e
          </text>
        </svg>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">noise e</span>
            <span className={`font-mono text-xs ${Math.abs(noise) > 400 ? "text-cyber-rose" : "text-cyber-cyan"}`}>
              {noise > 0 ? "+" : ""}{noise}
            </span>
          </div>
          <input
            type="range"
            min={-900}
            max={900}
            step={1}
            value={noise}
            onChange={(event) => setNoise(Number(event.target.value))}
            className="lab-range mt-4"
            aria-label="Noise magnitude"
          />
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Drag the noise across a decision boundary to force a mis-decode. Real ML-KEM keeps this error
            astronomically far from the boundary.
          </p>
        </label>

        <label className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">compression d</span>
            <span className="font-mono text-xs text-cyber-violet">{d} bits</span>
          </div>
          <input
            type="range"
            min={1}
            max={11}
            step={1}
            value={d}
            onChange={(event) => setD(Number(event.target.value))}
            className="lab-range mt-4"
            aria-label="Compression bits"
          />
          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            ML-KEM compresses the message polynomial with d = 4 and the vector component with d = 10.
            Coarser compression shrinks ciphertexts but consumes correctness margin.
          </p>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "mu", value: result.mu },
          { label: "compressed", value: result.compressed },
          { label: "v' = decompress", value: result.recovered },
          { label: "total error", value: result.totalError },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
            <p className="mt-1 font-mono text-sm text-slate-200">{item.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[10px] text-slate-500">
        decoded bit = {result.decoded} · expected = {bit} · rounding contribution = {result.rounding}
      </p>
    </div>
  );
}
