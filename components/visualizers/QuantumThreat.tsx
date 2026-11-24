"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const DATA = [
  { name: "RSA-2048 / DH-2048", classical: 112, quantum: 0, reason: "Shor · factoring & discrete log" },
  { name: "ECC-256 (P-256)", classical: 128, quantum: 0, reason: "Shor · elliptic-curve discrete log" },
  { name: "ECC-384 (P-384)", classical: 192, quantum: 0, reason: "Shor · elliptic-curve discrete log" },
  { name: "AES-128", classical: 128, quantum: 64, reason: "Grover · exhaustive key search" },
  { name: "AES-256", classical: 256, quantum: 128, reason: "Grover · exhaustive key search" },
  { name: "SHA-256 collision", classical: 128, quantum: 85, reason: "BHT / Grover · collision search" },
];

export function QuantumThreat() {
  const [quantum, setQuantum] = useState(false);
  const max = 256;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-lg border border-line">
          <button
            type="button"
            onClick={() => setQuantum(false)}
            aria-pressed={!quantum}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${!quantum ? "bg-cyber-cyan/15 text-cyber-cyan" : "text-slate-400"}`}
          >
            Classical attacker
          </button>
          <button
            type="button"
            onClick={() => setQuantum(true)}
            aria-pressed={quantum}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${quantum ? "bg-cyber-rose/15 text-cyber-rose" : "text-slate-400"}`}
          >
            Quantum attacker
          </button>
        </div>
        <span className="chip">security bits · higher is better</span>
      </div>

      <div className="mt-5 space-y-3">
        {DATA.map((item) => {
          const bits = quantum ? item.quantum : item.classical;
          const broken = bits < 32;
          return (
            <div key={item.name} className="grid grid-cols-[130px_1fr_46px] items-center gap-3 sm:grid-cols-[160px_1fr_52px]">
              <span className="font-mono text-[10px] text-slate-400">{item.name}</span>
              <div className="relative h-7 overflow-hidden rounded-md border border-line bg-ink-950/60">
                <motion.div
                  initial={false}
                  animate={{ width: `${Math.max(bits / max, broken ? 0.02 : 0) * 100}%` }}
                  transition={{ duration: 0.45 }}
                  className={broken ? "h-full bg-cyber-rose/35" : bits < 100 ? "h-full bg-cyber-amber/30" : "h-full bg-emerald-400/30"}
                />
                <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[9px] text-slate-400">
                  {broken ? "≈ broken" : item.reason}
                </span>
              </div>
              <span className={`text-right font-mono text-xs ${broken ? "text-cyber-rose" : "text-slate-200"}`}>
                {broken ? "0" : bits}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-cyber-rose/25 bg-cyber-rose/[0.06] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cyber-rose">Shor · structural break</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Polynomial-time factoring and discrete log. RSA, finite-field DH, and ECC lose essentially all
            security; no key-size increase rescues them.
          </p>
        </div>
        <div className="rounded-lg border border-cyber-amber/25 bg-cyber-amber/[0.06] p-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cyber-amber">Grover · quadratic speed-up</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            Search cost drops from 2^k to about 2^(k/2). Symmetric keys and hash outputs keep security by
            doubling their target size.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        Estimates are coarse and assume a cryptographically relevant quantum computer. They explain the
        migration logic, not a precise attack budget.
      </p>
    </div>
  );
}
