import { Cpu, FlaskConical, TriangleAlert } from "lucide-react";
import type { LabEngine } from "@/lib/wasm/pqcLab";

export function EngineBadge({ engine, error }: { engine: LabEngine | null; error: string | null }) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyber-rose/30 bg-cyber-rose/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-cyber-rose">
        <TriangleAlert className="h-3 w-3" /> engine error
      </span>
    );
  }

  if (!engine) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">
        <FlaskConical className="h-3 w-3 animate-pulse" /> loading engine
      </span>
    );
  }

  const wasm = engine.kind === "wasm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${
        wasm
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-cyber-amber/30 bg-cyber-amber/10 text-cyber-amber"
      }`}
      title={wasm ? "Rust-compiled WebAssembly engine with a passing self-test" : "WebAssembly unavailable; deterministic TypeScript implementation"}
    >
      {wasm ? <Cpu className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
      {wasm ? "Wasm engine active" : "TypeScript fallback"}
    </span>
  );
}
