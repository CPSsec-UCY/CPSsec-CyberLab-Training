"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

const BOUND = 100;

function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Attempt {
  norm: number;
  passesBound: boolean;
}

export function RejectionSampling() {
  const [enforceBound, setEnforceBound] = useState(true);
  const [seed, setSeed] = useState(7);
  const [visible, setVisible] = useState(6);

  const attempts = useMemo<Attempt[]>(() => {
    const random = mulberry32(seed);
    return Array.from({ length: 12 }, () => {
      const norm = Math.round((0.45 + random() * 1.05) * BOUND);
      return { norm, passesBound: norm <= BOUND };
    });
  }, [seed]);

  const shown = attempts.slice(0, visible);
  const accepted = shown.filter((attempt) => !enforceBound || attempt.passesBound);
  const leakRisk = !enforceBound && shown.some((attempt) => !attempt.passesBound);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-3">
          <span className="relative inline-flex">
            <input
              type="checkbox"
              checked={enforceBound}
              onChange={(event) => setEnforceBound(event.target.checked)}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full border border-white/10 bg-ink-700 transition peer-checked:border-cyber-cyan/40 peer-checked:bg-cyber-cyan/30" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-slate-400 transition peer-checked:translate-x-5 peer-checked:bg-cyber-cyan" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            enforce norm bound
          </span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSeed((value) => value + 1);
              setVisible(6);
            }}
            className="btn-ghost px-3 py-1.5 text-[10px]"
          >
            <RefreshCw className="h-3 w-3" /> New randomness
          </button>
          <button
            type="button"
            onClick={() => setVisible((value) => Math.min(12, value + 1))}
            className="btn-primary px-3 py-1.5 text-[10px]"
            disabled={visible >= 12}
          >
            Next attempt
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-2" aria-live="polite">
        {shown.map((attempt, index) => {
          const acceptedAttempt = !enforceBound || attempt.passesBound;
          const dangerous = !enforceBound && !attempt.passesBound;
          return (
            <div key={index} className="grid grid-cols-[52px_1fr_86px] items-center gap-3">
              <span className="font-mono text-[10px] text-slate-500">#{String(index + 1).padStart(2, "0")}</span>
              <div className="relative h-7 overflow-hidden rounded-md border border-white/10 bg-ink-950/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (attempt.norm / (1.7 * BOUND)) * 100)}%` }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className={`h-full ${dangerous ? "bg-cyber-rose/40" : attempt.passesBound ? "bg-emerald-400/30" : "bg-cyber-amber/25"}`}
                />
                <div
                  className="absolute inset-y-0 border-l border-dashed border-white/40"
                  style={{ left: `${(100 / (1.7 * BOUND)) * BOUND}%` }}
                />
                <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[10px] text-slate-300">
                  ||z||∞ = {attempt.norm}
                </span>
              </div>
              <span className={`text-right font-mono text-[9px] uppercase tracking-[0.1em] ${
                dangerous ? "text-cyber-rose" : acceptedAttempt ? "text-emerald-300" : "text-cyber-amber"
              }`}>
                {dangerous ? "leak" : acceptedAttempt ? "accept" : "reject"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">attempts shown</p>
          <p className="mt-1 font-mono text-lg text-slate-200">{shown.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">signatures produced</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">{accepted.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">rejection rate</p>
          <p className="mt-1 font-mono text-lg text-cyber-amber">
            {shown.length === 0 ? "0" : Math.round(((shown.length - accepted.length) / shown.length) * 100)}%
          </p>
        </div>
      </div>

      {leakRisk ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-cyber-rose/40 bg-cyber-rose/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-cyber-rose" />
          <p className="text-xs leading-5 text-rose-100">
            With the bound disabled, out-of-range signatures are released. Their distribution depends on the
            secret <span className="font-mono">s1</span>, which enables key-recovery attacks. ML-DSA rejects and
            resamples instead.
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        Toy scale: the dashed line is a stand-in for ML-DSA&apos;s bound on{" "}
        <span className="font-mono">||z||∞</span>. A real implementation uses γ1 − β with parameters chosen so
        rejection is rare but leakage is negligible.
      </p>
    </div>
  );
}
