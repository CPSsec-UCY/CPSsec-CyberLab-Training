"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type Algorithm = "factor" | "discrete-log" | "search";

type Stage = {
  title: string;
  summary: string;
  detail: string;
};

const ALGORITHMS: { id: Algorithm; label: string; toy: string }[] = [
  { id: "factor", label: "Factor", toy: "N = 15, a = 7" },
  { id: "discrete-log", label: "Discrete log", toy: "g = 3, h = 10, mod 17" },
  { id: "search", label: "Search", toy: "4-bit key space" },
];

const STAGES: Record<Algorithm, Stage[]> = {
  factor: [
    {
      title: "State preparation",
      summary: "Put x into equal superposition",
      detail: "A quantum register represents many candidate exponents at once. This is not a list of parallel classical guesses; the amplitudes interfere.",
    },
    {
      title: "Modular exponentiation",
      summary: "Compute f(x) = 7ˣ mod 15",
      detail: "The reversible circuit maps x to 1, 7, 4, 13, 1, 7, 4, 13… The repeated pattern contains the order r = 4.",
    },
    {
      title: "QFT & period detection",
      summary: "Interference reveals the repeat",
      detail: "The quantum Fourier transform turns periodicity into measurable peaks. Continued fractions recover candidate period 4; real runs repeat to resolve ambiguity.",
    },
    {
      title: "Classical post-processing",
      summary: "Use two greatest common divisors",
      detail: "Because r is even, compute gcd(7² − 1, 15) = 3 and gcd(7² + 1, 15) = 5. The quantum routine supplied the period, not the factors directly.",
    },
    {
      title: "Attack outcome",
      summary: "15 = 3 × 5",
      detail: "For an RSA-sized modulus the same reduction runs in polynomial time in log N. Increasing N raises circuit cost but does not restore the broken hardness assumption.",
    },
  ],
  "discrete-log": [
    {
      title: "State preparation",
      summary: "Superpose exponents in the group",
      detail: "Prepare candidate exponents x modulo the group order. The aim is to expose the order of the generator before solving the logarithm classically.",
    },
    {
      title: "Group exponentiation",
      summary: "Compute f(x) = 3ˣ mod 17",
      detail: "The first values are 1, 3, 9, 10, 13, 5, 15, 11… and repeat after 16 steps, revealing the group order.",
    },
    {
      title: "QFT & period detection",
      summary: "Measure the order r = 16",
      detail: "Phase estimation and a QFT recover the period of the group action. Larger groups require more precision and fault-tolerant qubits, not a different security model.",
    },
    {
      title: "Classical post-processing",
      summary: "Reduce 3ˣ = 10 modulo 16",
      detail: "Knowing the order lets the attacker reduce the discrete logarithm to a smaller congruence. For this toy, 3³ = 27 ≡ 10 mod 17, so x = 3.",
    },
    {
      title: "Attack outcome",
      summary: "Recovered x = 3",
      detail: "Shor applies to finite-field and elliptic-curve discrete logs. Larger DH or ECC parameters increase work but do not provide an asymptotic escape.",
    },
  ],
  search: [
    {
      title: "State preparation",
      summary: "Superpose all 16 keys",
      detail: "Start with a uniform superposition over the 4-bit search space. Every candidate begins with the same measurement probability.",
    },
    {
      title: "Oracle markings",
      summary: "Mark the matching key 1011",
      detail: "The oracle changes the phase of the target key. It does not reveal which key was marked; the information is encoded in interference.",
    },
    {
      title: "Amplitude amplification",
      summary: "Reflect about the average",
      detail: "Grover diffusion rotates amplitude toward the marked item. One ideal iteration cycle uses roughly π/4√N oracle calls for one target.",
    },
    {
      title: "Measurement",
      summary: "Observe 1011 with high probability",
      detail: "Measurement collapses to the amplified key. Repetition raises confidence when the ideal success probability is not high enough.",
    },
    {
      title: "Attack outcome",
      summary: "16 candidates → about 4 iterations",
      detail: "The quantum speed-up is quadratic: 2ᵏ classical key trials become about 2ᵏ⁄². Doubling a symmetric key restores the original security margin.",
    },
  ],
};

function SuperpositionDiagram() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="grid grid-cols-8 gap-2 sm:gap-3" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end justify-center rounded-lg border border-brand-100 bg-brand-50/60 p-1.5">
              <div className="w-full rounded bg-brand-400 motion-safe:animate-pulse motion-safe:transition-all motion-safe:duration-500" style={{ height: "55%" }} />
            </div>
            <span className="font-mono text-[9px] text-muted">{index}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-brand-700">|ψ⟩ = 1/√8 · Σ|x⟩</p>
    </div>
  );
}

function FunctionDiagram({ algorithm }: { algorithm: Algorithm }) {
  const values = algorithm === "factor" ? [1, 7, 4, 13] : [1, 3, 9, 10];
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-center font-mono text-[11px] text-navy">
        {algorithm === "factor" ? "f(x) = 7ˣ mod 15" : "f(x) = 3ˣ mod 17"}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {values.map((value, index) => (
          <div key={value} className="rounded-xl border border-line bg-mist-50 p-3 text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">x = {index}</p>
            <p className="mt-2 font-mono text-xl font-bold text-brand-700">{value}</p>
            <ArrowRight className="mx-auto mt-2 h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
            <p className="font-mono text-[9px] text-body">f(x)</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-center font-mono text-[10px] text-gold-600">
        pattern repeats every {algorithm === "factor" ? "4" : "16"} steps
      </p>
    </div>
  );
}

function InterferenceDiagram({ algorithm }: { algorithm: Algorithm }) {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex h-28 items-end gap-1.5 rounded-xl border border-line bg-mist-50 px-3 pb-3 pt-4" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => {
          const peak = algorithm === "search" ? index === 11 : index % 4 === 0;
          return (
            <div
              key={index}
              className={`flex-1 rounded-t motion-safe:transition-all motion-safe:duration-500 ${peak ? "bg-brand-400 motion-safe:animate-pulse" : "bg-brand-100"}`}
              style={{ height: peak ? "88%" : "18%" }}
            />
          );
        })}
      </div>
      <p className="mt-3 text-center font-mono text-[10px] text-brand-700">
        {algorithm === "search" ? "amplitude concentrates at 1011" : "QFT peaks expose periodic structure"}
      </p>
    </div>
  );
}

function ClassicalDiagram({ algorithm }: { algorithm: Algorithm }) {
  if (algorithm === "search") {
    return (
      <div className="flex h-full flex-col justify-center">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, index) => {
            const marked = index === 11;
            return (
              <div
                key={index}
                className={`rounded-lg border px-2 py-3 text-center font-mono text-[10px] motion-safe:transition-all motion-safe:duration-500 ${
                  marked ? "border-brand-300 bg-brand-100 font-bold text-brand-800 motion-safe:animate-pulse" : "border-line bg-white text-muted"
                }`}
              >
                {index.toString(2).padStart(4, "0")}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11px] text-body">Phase flip + diffusion amplify one marked state.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-brand-700">quantum result</p>
        <p className="mt-1 font-mono text-lg font-bold text-navy">{algorithm === "factor" ? "period r = 4" : "group order r = 16"}</p>
      </div>
      <ArrowRight className="mx-auto h-4 w-4 text-brand-300" aria-hidden="true" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] text-body">{algorithm === "factor" ? "gcd(7² − 1, 15)" : "3ˣ mod 17 = 10"}</p>
          <p className="mt-1 font-mono text-lg font-bold text-teal-600">{algorithm === "factor" ? "3" : "x ≡ 3 mod 16"}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="font-mono text-[10px] text-body">{algorithm === "factor" ? "gcd(7² + 1, 15)" : "3³ = 27"}</p>
          <p className="mt-1 font-mono text-lg font-bold text-teal-600">{algorithm === "factor" ? "5" : "27 mod 17 = 10"}</p>
        </div>
      </div>
    </div>
  );
}

function OutcomeDiagram({ algorithm }: { algorithm: Algorithm }) {
  const search = algorithm === "search";
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
      <span className="rounded-full border border-brand-200 bg-white px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700">
        illustrative toy result
      </span>
      <p className="mt-4 font-mono text-2xl font-bold text-navy sm:text-3xl">
        {search ? "1011" : algorithm === "factor" ? "15 = 3 × 5" : "x = 3"}
      </p>
      <p className="mt-3 max-w-md text-xs leading-5 text-body">
        {search
          ? "A 4-bit search is tiny. The useful lesson is how the operation count scales with key length."
          : "The quantum subroutine exposes algebraic structure; the final arithmetic is classical."}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2 font-mono text-[10px]">
        <span className="rounded-md border border-line bg-white px-2.5 py-1 text-muted">classical: {search ? "2⁴" : "subexponential / group cost"}</span>
        <span className="rounded-md border border-coral-200 bg-coral-50 px-2.5 py-1 text-coral-600">quantum: {search ? "≈2²" : "polynomial in log N"}</span>
      </div>
    </div>
  );
}

function QuantumDiagram({ algorithm, step }: { algorithm: Algorithm; step: number }) {
  return (
    <div className="min-h-[220px] rounded-xl border border-line bg-white p-4 sm:p-5">
      {step === 0 ? <SuperpositionDiagram /> : null}
      {step === 1 ? (algorithm === "search" ? <ClassicalDiagram algorithm={algorithm} /> : <FunctionDiagram algorithm={algorithm} />) : null}
      {step === 2 ? <InterferenceDiagram algorithm={algorithm} /> : null}
      {step === 3 ? <ClassicalDiagram algorithm={algorithm} /> : null}
      {step === 4 ? <OutcomeDiagram algorithm={algorithm} /> : null}
    </div>
  );
}

export function QuantumAttackLab() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("factor");
  const [step, setStep] = useState(0);
  const stages = STAGES[algorithm];
  const current = stages[step];
  const selected = ALGORITHMS.find((item) => item.id === algorithm) ?? ALGORITHMS[0];

  function reset() {
    setAlgorithm("factor");
    setStep(0);
  }

  return (
    <VisualizerShell
      title="Quantum attack lab"
      description="Step through idealised order finding and Grover search using tiny, deterministic examples."
      onReset={reset}
      controls={
        <>
          <div className="flex overflow-hidden rounded-lg border border-line bg-white" role="group" aria-label="Quantum algorithm">
            {ALGORITHMS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={algorithm === item.id}
                onClick={() => {
                  setAlgorithm(item.id);
                  setStep(0);
                }}
                className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${
                  algorithm === item.id ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-mist-50 hover:text-navy"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep((value) => Math.min(value + 1, stages.length - 1))}
            disabled={step === stages.length - 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next stage <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </>
      }
      footer={
        <p>
          Conceptual model of Shor&apos;s order-finding algorithm and Grover&apos;s search algorithm. Toy values, security-bit targets and query counts are illustrative, not resource estimates for a real quantum computer.
        </p>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-700">{selected.label}</p>
        <p className="rounded-md border border-line bg-mist-50 px-2 py-1 font-mono text-[10px] text-body">{selected.toy}</p>
      </div>

      <div className="mt-3" key={`${algorithm}-${step}`}>
        <QuantumDiagram algorithm={algorithm} step={step} />
      </div>

      <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4" aria-live="polite">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700">stage {step + 1} / {stages.length}</p>
        <h4 className="mt-1 text-sm font-bold text-navy">{current.title}</h4>
        <p className="mt-1 text-xs font-semibold text-body">{current.summary}</p>
        <p className="mt-2 text-xs leading-5 text-body">{current.detail}</p>
      </div>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="Quantum attack stages">
        {stages.map((stage, index) => (
          <StepButton key={stage.title} active={step === index} done={index < step} onClick={() => setStep(index)}>
            {index + 1}. {stage.title}
          </StepButton>
        ))}
      </nav>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-coral-200 bg-coral-50/60 p-4" aria-labelledby="shor-comparison-title">
          <h4 id="shor-comparison-title" className="text-xs font-bold text-coral-700">Shor: structural break</h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="RSA / DH-2048 classical" value="≈112 bits" tone="gold" />
            <Metric label="Large quantum computer" value="broken" tone="coral" />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-body">
            Factoring and discrete log become polynomial-time problems. Larger RSA, DH or ECC keys do not restore their security assumption; migrate to a post-quantum primitive.
          </p>
        </section>
        <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-4" aria-labelledby="grover-comparison-title">
          <h4 id="grover-comparison-title" className="text-xs font-bold text-teal-700">Grover: quadratic speed-up</h4>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="AES-128 classical → quantum" value="128 → 64" tone="gold" />
            <Metric label="AES-256 classical → quantum" value="256 → 128" tone="teal" />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-body">
            Key search drops from about 2ᵏ to 2ᵏ⁄². Doubling a symmetric key preserves the target security margin, although real attack costs include substantial overhead.
          </p>
        </section>
      </div>
    </VisualizerShell>
  );
}
