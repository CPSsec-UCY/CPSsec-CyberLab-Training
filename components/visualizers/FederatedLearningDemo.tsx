"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

type Mode = "centralised" | "federated" | "secure";

const MODES: { id: Mode; label: string; detail: string }[] = [
  { id: "centralised", label: "Centralised", detail: "Raw training data moves to one server." },
  { id: "federated", label: "Federated", detail: "Data stays local; model updates are shared." },
  { id: "secure", label: "Secure aggregation", detail: "Updates are masked; the server sees only the sum." },
];

const CLIENTS = [
  { id: "A", samples: 420, region: "Nicosia" },
  { id: "B", samples: 310, region: "Limassol" },
  { id: "C", samples: 580, region: "Larnaca" },
  { id: "D", samples: 260, region: "Remote" },
];

export function FederatedLearningDemo() {
  const [mode, setMode] = useState<Mode>("federated");
  const [malicious, setMalicious] = useState(false);
  const [round, setRound] = useState(0);

  const result = useMemo(() => {
    const poison = malicious && round > 0;
    const toyScore = poison ? Math.max(55, 92 - round * 6) : 92;
    const exposure =
      mode === "centralised" ? "raw records" : mode === "federated" ? "individual updates" : "only the aggregate";
    const privacy =
      mode === "centralised" ? "centralised raw-data risk" : mode === "federated" ? "updates may leak information" : "hides individual updates";
    const integrity = poison ? "poisoned update enters sum" : "not evaluated by this toy";
    return { toyScore, exposure, privacy, integrity };
  }, [malicious, mode, round]);

  function reset() {
    setRound(0);
    setMalicious(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setMode(item.id); setRound(0); }}
            aria-pressed={mode === item.id}
            className={`rounded-xl border px-3 py-2 text-left transition ${
              mode === item.id ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body hover:border-brand-200"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-[0.1em]">{item.label}</span>
            <span className="mt-0.5 block text-[9px] text-muted">{item.detail}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_210px]">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">training round {round}</span>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-body">
                <input type="checkbox" checked={malicious} onChange={(event) => setMalicious(event.target.checked)} className="accent-rose-500" />
                malicious client
              </label>
              <button type="button" onClick={() => setRound((value) => value + 1)} className="btn-primary px-3 py-1.5 text-[10px]">
                <RefreshCw className="h-3 w-3" /> Run round
              </button>
              <button type="button" onClick={reset} className="btn-ghost px-2.5 py-1.5 text-[10px]">Reset</button>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {CLIENTS.map((client, index) => (
              <div key={client.id} className={`rounded-lg border bg-white p-3 ${malicious && index === 2 ? "border-rose-300" : "border-line"}`}>
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-[10px] font-bold text-brand-700">{client.id}</span>
                  {malicious && index === 2 ? <ShieldAlert className="h-4 w-4 text-rose-500" /> : <Users className="h-4 w-4 text-muted" />}
                </div>
                <p className="mt-2 text-[10px] font-semibold text-navy">{client.samples} samples</p>
                <p className="text-[9px] text-muted">{client.region}</p>
                <p className="mt-2 text-[9px] font-semibold text-brand-700">
                  {mode === "centralised" ? "uploads raw data" : mode === "federated" ? "uploads Δw" : "uploads masked Δw"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <span className="rounded-full border border-line bg-white px-3 py-1 text-[10px] font-semibold text-body">local training</span>
            <ArrowRight className="h-4 w-4 rotate-90 text-brand-400 sm:rotate-0" />
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${mode === "secure" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-brand-200 bg-brand-50 text-brand-700"}`}>
              {mode === "secure" ? "masked sum" : "server aggregation"}
            </span>
            <ArrowRight className="h-4 w-4 rotate-90 text-brand-400 sm:rotate-0" />
            <span className="rounded-full border border-line bg-white px-3 py-1 text-[10px] font-semibold text-body">global model</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">server observes</p>
            <p className="mt-1 text-xs font-semibold text-navy">{result.exposure}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">toy model score</p>
            <p className={`mt-1 text-xl font-bold ${result.toyScore < 80 ? "text-rose-600" : "text-emerald-600"}`}>{result.toyScore}%</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">Illustrative deterministic value, not an empirical benchmark or calibrated probability.</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">privacy property</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-navy">{result.privacy}</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">Secure aggregation is not a differential-privacy guarantee.</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">integrity property</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-navy">{result.integrity}</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">Confidentiality controls do not establish robustness to poisoning.</p>
          </div>
        </div>
      </div>

      <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${
        malicious ? "border-rose-200 bg-rose-50 text-rose-800" : "border-brand-200 bg-brand-50 text-brand-900"
      }`}>
        {malicious ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>
          {malicious
            ? mode === "secure"
              ? "Secure aggregation hides individual updates, but a poisoned update still enters the sum. Privacy does not imply integrity: use robust aggregation, clipping, validation or trusted execution."
              : "A malicious client can poison the global model. Federated learning removes raw-data exposure; it does not remove poisoning, Sybil or free-riding risks."
            : mode === "centralised"
              ? "The server sees raw records. That is the simplest architecture, but it concentrates privacy and breach risk."
              : "Clients train locally and share updates. Secure aggregation additionally prevents the server from inspecting individual updates, at the cost of more coordination and dropout handling."}
        </span>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-5 text-muted">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Client-side privacy is necessary but not sufficient; integrity needs its own controls.{" "}
        <Cite id="mcmahan2017" locator="§1–2" /> <Cite id="bonawitz2017" locator="§1–3" />{" "}
        <Cite id="bagdasaryan2020" locator="pp. 135–147" />
      </p>
    </div>
  );
}
