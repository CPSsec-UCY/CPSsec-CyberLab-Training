"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LENSES } from "@/lib/lenses";

const SAMPLES = [
  {
    level: 1 as const,
    headline: "A sealed envelope that checks its own seal",
    body: "Alice posts a locked box. Anyone can drop a secret inside and snap the lock shut. Only Alice can open it. If a courier swaps the box, Alice notices because the seal no longer matches the one she can reconstruct from the message inside — she returns a decoy secret instead of an error.",
    bullets: ["Attacker goal: distinguish real secrets from decoys", "Defender goal: make every failure look identical", "No algebra required"],
  },
  {
    level: 2 as const,
    headline: "Encapsulate, decapsulate, re-encrypt, compare",
    body: "ML-KEM-768 generates a 1,184-byte encapsulation key and a 1,088-byte ciphertext. Encapsulation samples a message m, derives (K, r) with SHA3/SHAKE, encrypts m under the public key, and outputs (c, K). Decapsulation decrypts c, re-derives (K′, r′), re-encrypts m′, and compares c′ with c in constant time. On mismatch it returns a rejection key instead of an error.",
    bullets: ["KeyGen → Encaps → Decaps", "FO transform gives IND-CCA2", "Hybrid TLS: X25519MLKEM768"],
  },
  {
    level: 3 as const,
    headline: "Module-LWE plus a re-encryption check",
    body: "Security reduces to Module-LWE over R_q = Z_q[X]/(X^256 + 1) with q = 3329. The CPA scheme encrypts m as u = Aᵀr + e₁, v = tᵀr + e₂ + ⌈q/2⌉·m. The FO transform binds the randomness r = G(m ‖ H(pk)) and rejects any ciphertext that does not re-encrypt to itself. A decryption failure δ is bounded below 2⁻¹³⁸ for the standardized parameters.",
    bullets: ["Correctness: ‖e‖∞ stays below q/4", "IND-CCA2 via FO with implicit rejection", "Hybrid argument over Module-LWE"],
  },
  {
    level: 4 as const,
    headline: "Branches are the enemy",
    body: "The decapsulation path must avoid secret-dependent branches and table indices. ML-KEM implementations use constant-time compression, Barrett/Montgomery reductions, and a full ciphertext comparison rather than early-exit memcmp. NTT butterflies are unrolled and vectorised; Keccak is the other hot loop. On constrained devices, masking and fault checks sit on top of constant-time code.",
    bullets: ["No secret-indexed memory lookups", "Barrett / Montgomery reduction", "AVX2, NEON, Keccak accelerators"],
  },
];

export function DepthDemo() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const sample = SAMPLES.find((item) => item.level === level) ?? SAMPLES[0];
  const meta = LENSES.find((item) => item.level === level) ?? LENSES[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-850/60">
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-3">
        {LENSES.map((lens) => {
          const active = lens.level === level;
          return (
            <button
              key={lens.level}
              type="button"
              onClick={() => setLevel(lens.level)}
              aria-pressed={active}
              className={`flex-1 rounded-lg border px-3 py-2 text-left transition sm:min-w-[140px] ${
                active ? `${lens.accentBorder} ${lens.accentBg}` : "border-white/10 bg-ink-950/40 hover:border-white/25"
              }`}
            >
              <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${active ? lens.accentText : "text-slate-600"}`}>
                L{lens.level} · {lens.short}
              </span>
              <span className={`mt-0.5 block text-[11px] ${active ? "text-white" : "text-slate-400"}`}>
                {lens.audience.split(",")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${meta.accentText}`}>{meta.name}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-white">{sample.headline}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{sample.body}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {sample.bullets.map((bullet) => (
                <li key={bullet} className="rounded-lg border border-white/10 bg-ink-950/50 px-3 py-2 text-[11px] leading-5 text-slate-400">
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t border-white/10 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
        Same ML-KEM concept · four audiences · citations preserved across the switch
      </div>
    </div>
  );
}
