import { CheckCircle2 } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

const ROWS = [
  { control: "Centralised training", privacy: "raw-data exposure", integrity: "no robustness", note: "server sees raw data" },
  { control: "Federated averaging", privacy: "updates may leak", integrity: "poisoning possible", note: "raw data stays local" },
  { control: "Secure aggregation", privacy: "hides individual updates", integrity: "poisoning possible", note: "server sees only the sum" },
  { control: "DP + clipping + robust aggregation", privacy: "budgeted privacy", integrity: "bounded robustness", note: "separate, layered controls" },
];

export function FederatedThreatMatrix() {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-mist-50 p-4" role="region" aria-label="Scrollable federated-learning threat matrix" tabIndex={0}>
      <div className="grid min-w-[480px] grid-cols-[1.5fr_105px_105px] gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
        <span>design</span>
        <span className="text-center">privacy</span>
        <span className="text-center">integrity</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {ROWS.map((row) => (
          <div key={row.control} className="grid min-w-[480px] grid-cols-[1.5fr_105px_105px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold text-navy">{row.control}</p>
              <p className="text-[8px] text-muted">{row.note}</p>
            </div>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-center text-[8px] font-semibold leading-3 text-brand-700">{row.privacy}</span>
            <span className={`rounded-full border px-2 py-1 text-center text-[8px] font-semibold leading-3 ${row.integrity === "poisoning possible" || row.integrity === "no robustness" ? "border-gold-200 bg-gold-50 text-gold-800" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{row.integrity}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] leading-4 text-muted">
        <CheckCircle2 className="h-3 w-3" /> Privacy and integrity are separate axes. The right column needs its own controls. <Cite id="bonawitz2017" locator="§1–3" /> <Cite id="bagdasaryan2020" locator="pp. 135–147" />
      </p>
    </div>
  );
}
