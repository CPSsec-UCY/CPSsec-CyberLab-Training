"use client";

import { useState } from "react";
import { Boxes, Sigma, TriangleAlert } from "lucide-react";
import { useLabEngine } from "@/components/lab/useLabEngine";
import { EngineBadge } from "@/components/lab/EngineBadge";
import { NttLab } from "@/components/lab/NttLab";
import { CompressionLab } from "@/components/lab/CompressionLab";
import { ParameterExplorer } from "@/components/visualizers/ParameterExplorer";

type Tab = "ntt" | "compression" | "parameters";

const TABS: { id: Tab; label: string; icon: typeof Sigma; detail: string }[] = [
  { id: "ntt", label: "NTT & ring arithmetic", icon: Sigma, detail: "live multiplication, round-trips and timings" },
  { id: "compression", label: "Compression & correctness", icon: Boxes, detail: "rounding error and reconciliation margin" },
  { id: "parameters", label: "Parameter trade-offs", icon: Boxes, detail: "sizes, security levels and families" },
];

export function LabWorkbench() {
  const [tab, setTab] = useState<Tab>("ntt");
  const { engine, error } = useLabEngine();

  return (
    <div className="rounded-2xl border border-line bg-ink-850/50 shadow-panel">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition ${
                  tab === item.id
                    ? "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan"
                    : "border-line bg-ink-950/40 text-slate-400 hover:border-line-strong hover:text-navy"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
        <EngineBadge engine={engine} error={error} />
      </div>

      <div className="p-4 sm:p-6">
        {tab === "parameters" ? <ParameterExplorer /> : null}

        {tab !== "parameters" ? (
          error ? (
            <div className="flex items-start gap-3 rounded-xl border border-cyber-rose/30 bg-cyber-rose/10 p-4">
              <TriangleAlert className="mt-0.5 h-4 w-4 text-cyber-rose" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyber-rose">Engine unavailable</p>
                <p className="mt-1 text-sm text-slate-300">{error}</p>
                <p className="mt-2 text-xs text-slate-500">
                  The parameter explorer still works. Check the browser console and the deployment artifact at{" "}
                  <code className="font-mono">/wasm/pqc_lab.wasm</code>.
                </p>
              </div>
            </div>
          ) : engine ? (
            tab === "ntt" ? <NttLab engine={engine} /> : <CompressionLab engine={engine} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-36 animate-pulse rounded-xl border border-line/75 bg-mist-50" />
              ))}
            </div>
          )
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-600 sm:px-6">
        <span>deterministic self-test on load · no secrets · runs locally</span>
        <span>Rust → wasm32 · TypeScript fallback</span>
      </div>
    </div>
  );
}
