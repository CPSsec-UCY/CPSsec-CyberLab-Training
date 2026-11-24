"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const Q = 17;
const PSI = 2;
const OMEGA = 4;
const N = 4;

function mod(value: number) {
  return ((value % Q) + Q) % Q;
}

function pow(base: number, exponent: number) {
  let result = 1;
  for (let index = 0; index < exponent; index += 1) result = mod(result * base);
  return result;
}

function bitReverse(value: number) {
  return ((value & 1) << 1) | ((value & 2) >> 1);
}

function computeStages(input: number[]) {
  const twisted = input.map((value, index) => mod(value * pow(PSI, index)));
  const permuted = Array.from({ length: N }, (_, index) => twisted[bitReverse(index)]);

  const stage1 = [...permuted];
  for (let block = 0; block < N; block += 2) {
    const u = stage1[block];
    const v = stage1[block + 1];
    stage1[block] = mod(u + v);
    stage1[block + 1] = mod(u - v);
  }

  const stage2 = [...stage1];
  for (let j = 0; j < 2; j += 1) {
    const w = pow(OMEGA, j);
    const u = stage2[j];
    const v = mod(stage2[j + 2] * w);
    stage2[j] = mod(u + v);
    stage2[j + 2] = mod(u - v);
  }

  return { twisted, permuted, stage1, stage2 };
}

const STEP_LABELS = [
  "Untwist the negacyclic ring",
  "Pre-twist by ψ^j and bit-reverse",
  "Butterflies with span 2",
  "Butterflies with span 4 (twiddles 1, ω)",
  "Natural-order NTT output",
];

export function NttButterfly() {
  const [input, setInput] = useState([1, 2, 3, 4]);
  const [step, setStep] = useState(0);

  const stages = useMemo(() => computeStages(input), [input]);

  const arrays = [input, stages.permuted, stages.stage1, stages.stage2, stages.stage2];
  const current = arrays[step];

  function update(index: number, value: number) {
    setInput((values) => values.map((entry, position) => (position === index ? mod(value) : entry)));
    setStep(0);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">input coefficients</span>
          {input.map((value, index) => (
            <input
              key={index}
              type="number"
              min={0}
              max={16}
              value={value}
              onChange={(event) => update(index, Number(event.target.value))}
              className="h-8 w-12 rounded-md border border-white/10 bg-ink-950/60 text-center font-mono text-xs text-cyber-cyan focus:border-cyber-cyan/50"
              aria-label={`Coefficient ${index}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setInput([1, 2, 3, 4]);
              setStep(0);
            }}
            className="btn-ghost px-2.5 py-1.5 text-[10px]"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            className="btn-ghost px-2.5 py-1.5 text-[10px]"
            disabled={step === 0}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((value) => Math.min(4, value + 1))}
            className="btn-primary px-2.5 py-1.5 text-[10px]"
          >
            Next stage
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/50 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-cyan">
            stage {step} / 4 · {STEP_LABELS[step]}
          </p>
          <span className="chip">q = {Q} · ψ = {PSI} · n = {N}</span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {current.map((value, index) => {
            const highlighted =
              step === 1 ||
              (step === 2 && index < 4) ||
              (step === 3 && index < 4) ||
              step === 4;
            return (
              <div
                key={index}
                className={`rounded-lg border p-2 text-center transition ${
                  highlighted ? "border-cyber-cyan/30 bg-cyber-cyan/[0.06]" : "border-white/10 bg-ink-900/60"
                }`}
              >
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">a[{index}]</p>
                <motion.p
                  key={`${step}-${index}-${value}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 font-mono text-lg text-slate-100"
                >
                  {value}
                </motion.p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-ink-900/60 p-3 font-mono text-[11px] leading-6 text-slate-300">
          {step === 0 ? (
            <span>Negacyclic product would need 16 multiplications for n = 4; butterflies reduce this to {N / 2} · log₂{N} = 4.</span>
          ) : null}
          {step === 1 ? (
            <span>Pre-twist b[j] = a[j] · ψ^j = [{stages.twisted.join(", ")}], then bit-reverse the indices to [{stages.permuted.join(", ")}].</span>
          ) : null}
          {step === 2 ? (
            <span>
              Pairs (0,1) and (2,3): u + v and u − v. No twiddle is needed because the span is 2 and ω^0 = 1.
            </span>
          ) : null}
          {step === 3 ? (
            <span>
              Pairs (0,2) and (1,3): twiddles 1 and ω = {OMEGA}. Output [{stages.stage2.join(", ")}] — the negacyclic
              NTT of the input.
            </span>
          ) : null}
          {step === 4 ? (
            <span>
              Verification: for each coefficient, y[k] = Σ a[j] · ψ^((2k+1)j) mod {Q}. The forward transform is now
              ready for point-wise multiplication.
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-3">
        <svg viewBox="0 0 660 150" className="min-w-[560px]" role="img" aria-label="Butterfly diagram for a four point NTT">
          {[0, 1, 2, 3].map((index) => (
            <g key={index}>
              <line x1="40" y1={30 + index * 30} x2="190" y2={30 + index * 30} stroke="rgba(148,163,184,0.25)" />
              <line x1="250" y1={30 + index * 30} x2="420" y2={30 + index * 30} stroke="rgba(148,163,184,0.25)" />
              <line x1="480" y1={30 + index * 30} x2="620" y2={30 + index * 30} stroke="rgba(148,163,184,0.25)" />
              <text x="20" y={34 + index * 30} fill="#64748b" fontSize="9" fontFamily="monospace">b{index}</text>
              <text x="625" y={34 + index * 30} fill="#67e8f9" fontSize="9" fontFamily="monospace">B{index}</text>
            </g>
          ))}

          {[
            [0, 1, 2, 1],
            [2, 3, 2, 1],
            [0, 2, 4, 4],
            [1, 3, 4, 4],
          ].map(([from, to, span, twiddle], index) => {
            const midX = 350 + (index % 2) * 40;
            const y1 = 30 + from * 30;
            const y2 = 30 + to * 30;
            return (
              <g key={index}>
                <path
                  d={`M 250 ${y1} C 320 ${y1}, ${midX} ${(y1 + y2) / 2}, ${midX} ${(y1 + y2) / 2} C ${midX} ${(y1 + y2) / 2}, 400 ${y2}, 470 ${y2}`}
                  fill="none"
                  stroke={index < 2 ? "rgba(34,211,238,0.5)" : "rgba(167,139,250,0.65)"}
                  strokeWidth="1.2"
                />
                <circle cx={midX} cy={(y1 + y2) / 2} r="3" fill={index < 2 ? "#22d3ee" : "#a78bfa"} />
                <text x={midX + 6} y={(y1 + y2) / 2 - 4} fill={index < 2 ? "#67e8f9" : "#c4b5fd"} fontSize="8" fontFamily="monospace">
                  {twiddle === 1 ? "×1" : "×ω"}
                </text>
                <text x={midX - 8} y={(y1 + y2) / 2 + 12} fill="#475569" fontSize="7" fontFamily="monospace">
                  span {span}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        Toy parameters make every value auditable by hand. ML-KEM uses n = 256, q = 3329 and a seven-layer
        incomplete NTT; the same butterfly logic applies.
      </p>
    </div>
  );
}
