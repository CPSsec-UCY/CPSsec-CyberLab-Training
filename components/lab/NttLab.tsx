"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Dices, Timer, Waypoints } from "lucide-react";
import type { LabEngine } from "@/lib/wasm/pqcLab";
import { CoefficientChart } from "@/components/lab/CoefficientChart";

interface ViewState {
  a: number[];
  b: number[];
  out: number[];
  label: string;
}

function timeAverage(operation: () => void, runs = 25): number {
  const start = performance.now();
  for (let index = 0; index < runs; index += 1) operation();
  return (performance.now() - start) / runs;
}

export function NttLab({ engine }: { engine: LabEngine }) {
  const [seed, setSeed] = useState(42);
  const [view, setView] = useState<ViewState | null>(null);
  const [timings, setTimings] = useState<{ ntt: number; naive: number } | null>(null);
  const [match, setMatch] = useState<boolean | null>(null);
  const [inspector, setInspector] = useState(0);

  const snapshot = useCallback(
    (label: string): ViewState => ({
      a: engine.read("a"),
      b: engine.read("b"),
      out: engine.read("out"),
      label,
    }),
    [engine],
  );

  useEffect(() => {
    engine.seed(seed);
    setView(snapshot("input polynomials"));
    setMatch(null);
    setTimings(null);
  }, [engine, seed, snapshot]);

  function forward() {
    engine.seed(seed);
    engine.ntt("a");
    setView(snapshot("A after forward NTT · B untouched"));
  }

  function roundTrip() {
    engine.seed(seed);
    engine.ntt("a");
    engine.invntt("a");
    setView(snapshot("A after NTT → inverse NTT · should equal the input"));
  }

  function multiply() {
    engine.seed(seed);
    const originalA = engine.read("a");
    const originalB = engine.read("b");

    engine.ntt("a");
    engine.ntt("b");
    engine.pointwiseMul();
    engine.invntt("out");
    const viaNtt = engine.read("out");

    engine.seed(seed);
    engine.naiveMul();
    const naive = engine.read("out");
    setMatch(viaNtt.every((value, index) => value === naive[index]));

    engine.seed(seed);
    engine.ntt("a");
    engine.ntt("b");
    engine.pointwiseMul();
    engine.invntt("out");
    setView({ a: engine.read("a"), b: engine.read("b"), out: viaNtt, label: "product computed in the NTT domain" });
    void originalA;
    void originalB;

    const nttTime = timeAverage(() => {
      engine.seed(seed);
      engine.ntt("a");
      engine.ntt("b");
      engine.pointwiseMul();
      engine.invntt("out");
    });
    const naiveTime = timeAverage(() => {
      engine.seed(seed);
      engine.naiveMul();
    });
    setTimings({ ntt: nttTime, naive: naiveTime });
  }

  const q = engine.q;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setSeed((value) => value + 1)} className="btn-ghost px-3 py-1.5 text-[10px]">
          <Dices className="h-3 w-3" /> New polynomials
        </button>
        <button type="button" onClick={forward} className="btn-ghost px-3 py-1.5 text-[10px]">
          Forward NTT
        </button>
        <button type="button" onClick={roundTrip} className="btn-ghost px-3 py-1.5 text-[10px]">
          NTT → inverse
        </button>
        <button type="button" onClick={multiply} className="btn-primary px-3 py-1.5 text-[10px]">
          <Waypoints className="h-3 w-3" /> Multiply A × B
        </button>
        <span className="ml-auto font-mono text-[10px] text-slate-500">
          n = {engine.n} · q = {q} · seed {seed}
        </span>
      </div>

      {view ? (
        <>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <CoefficientChart values={view.a} label="A" id="a" accent="fill-cyber-cyan/70" q={q} />
            <CoefficientChart values={view.b} label="B" id="b" accent="fill-cyber-violet/70" q={q} />
            <CoefficientChart values={view.out} label="OUT" id="out" accent="fill-cyber-amber/70" q={q} />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">{view.label}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-white/10 bg-ink-950/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">coefficient inspector</span>
                <span className="font-mono text-[10px] text-cyber-cyan">i = {inspector}</span>
              </div>
              <input
                type="range"
                min={0}
                max={engine.n - 1}
                value={inspector}
                onChange={(event) => setInspector(Number(event.target.value))}
                className="lab-range mt-3"
                aria-label="Coefficient index"
              />
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px]">
                <span className="rounded bg-cyber-cyan/10 px-2 py-1 text-cyber-cyan">A {view.a[inspector]}</span>
                <span className="rounded bg-cyber-violet/10 px-2 py-1 text-cyber-violet">B {view.b[inspector]}</span>
                <span className="rounded bg-cyber-amber/10 px-2 py-1 text-cyber-amber">OUT {view.out[inspector]}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-ink-950/50 p-3 sm:w-56">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                <Timer className="h-3 w-3" /> average (browser)
              </div>
              {timings ? (
                <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                  <p>NTT ×: {timings.ntt.toFixed(3)} ms</p>
                  <p>naive ×: {timings.naive.toFixed(3)} ms</p>
                  <p className="text-slate-500">
                    naive / NTT ≈ {(timings.naive / Math.max(timings.ntt, 0.0001)).toFixed(2)}×
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-[11px] leading-5 text-slate-500">Run a multiplication to benchmark this device.</p>
              )}
              <p className="mt-2 text-[10px] leading-4 text-slate-600">
                {engine.n} coefficients · naive O(n²) = {(engine.n ** 2).toLocaleString("en-GB")} products.
                At this instructional size, browser and call overhead can dominate; the asymptotic gain
                becomes decisive at n = 256 with tuned vector code.
              </p>
            </div>
          </div>
        </>
      ) : null}

      {match !== null ? (
        <div className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] ${
          match ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-cyber-rose/30 bg-cyber-rose/10 text-cyber-rose"
        }`}>
          <ArrowRight className="h-3 w-3" />
          {match ? "NTT product equals the schoolbook negacyclic convolution" : "Mismatch between NTT and schoolbook product"}
        </div>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        The lab ring is n = 128 over q = 3329 because 3329 = 2⁸ · 13 + 1 admits a full 128-point negacyclic NTT.
        ML-KEM uses n = 256 and a seven-layer incomplete NTT plus a 2×2 base-case multiply. Both avoid secret-dependent
        branches in the inner loop.
      </p>
    </div>
  );
}
