"use client";

import { useMemo, useState } from "react";
import { Eye, RefreshCw, Shuffle } from "lucide-react";

const LINES = 16;

export function SideChannelLeak() {
  const [mode, setMode] = useState<"naive" | "constant">("naive");
  const [secret, setSecret] = useState(7);
  const [counts, setCounts] = useState<number[]>(() => Array(LINES).fill(0));

  const max = useMemo(() => Math.max(1, ...counts), [counts]);

  function run() {
    setCounts((current) => {
      const next = [...current];
      if (mode === "naive") {
        next[secret] += 1;
      } else {
        for (let index = 0; index < LINES; index += 1) next[index] += 1;
      }
      return next;
    });
  }

  function reset() {
    setCounts(Array(LINES).fill(0));
  }

  function randomSecret() {
    setSecret(Math.floor(Math.random() * LINES));
    reset();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex overflow-hidden rounded-lg border border-line">
          <button
            type="button"
            onClick={() => setMode("naive")}
            aria-pressed={mode === "naive"}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${mode === "naive" ? "bg-cyber-rose/15 text-cyber-rose" : "text-slate-400"}`}
          >
            table[secret]
          </button>
          <button
            type="button"
            onClick={() => setMode("constant")}
            aria-pressed={mode === "constant"}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${mode === "constant" ? "bg-emerald-400/15 text-emerald-300" : "text-slate-400"}`}
          >
            scan all lines
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">secret = {secret}</span>
          <button type="button" onClick={randomSecret} className="btn-ghost px-2.5 py-1.5 text-[10px]">
            <Shuffle className="h-3 w-3" /> Random
          </button>
          <button type="button" onClick={reset} className="btn-ghost px-2.5 py-1.5 text-[10px]">
            <RefreshCw className="h-3 w-3" /> Clear
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-8 gap-1.5">
        {Array.from({ length: LINES }).map((_, index) => {
          const intensity = counts[index] / max;
          return (
            <div
              key={index}
              className={`relative flex aspect-square items-center justify-center rounded-md border font-mono text-[9px] transition ${
                index === secret
                  ? "border-cyber-cyan/40"
                  : "border-line"
              }`}
              style={{
                backgroundColor:
                  intensity === 0
                    ? "rgba(108,77,246,0.06)"
                    : `rgba(34, 211, 238, ${0.08 + intensity * 0.55})`,
              }}
              title={`cache line ${index}: ${counts[index]} observations`}
            >
              {index}
              {index === secret ? <span className="absolute right-1 top-0.5 h-1 w-1 rounded-full bg-cyber-cyan" /> : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={run} className="btn-primary px-3 py-1.5 text-[10px]">
          <Eye className="h-3 w-3" /> Perform lookup
        </button>
        <span className="font-mono text-[10px] text-slate-500">
          total observations: {counts.reduce((sum, count) => sum + count, 0)}
        </span>
        <span className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${
          mode === "naive"
            ? "border-cyber-rose/30 bg-cyber-rose/10 text-cyber-rose"
            : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        }`}>
          {mode === "naive" ? "cache line reveals secret index" : "access pattern independent of secret"}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-line bg-ink-950/50 p-3 text-[11px] leading-5 text-slate-400">
        {mode === "naive" ? (
          <>
            The cache line containing the secret index is touched; all others stay cold. A Flush+Reload or
            Prime+Probe attacker recovers the index directly. The fix is not to load a different line, but to
            load <em>every</em> line and select in registers without secret-dependent branches.
          </>
        ) : (
          <>
            Every run touches every line exactly once. The attacker sees a uniform pattern, so the secret is not
            exposed through this channel. This is the shape of constant-time table scans used in ML-KEM and
            ML-DSA decoders.
          </>
        )}
      </div>
    </div>
  );
}
