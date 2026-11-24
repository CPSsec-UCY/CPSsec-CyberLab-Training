import { AlertTriangle, CheckCircle2, EyeOff, ShieldCheck } from "lucide-react";

const ROWS = [
  { control: "Centralised training", privacy: false, integrity: false, note: "server sees raw data" },
  { control: "Federated averaging", privacy: true, integrity: false, note: "updates can leak and poison" },
  { control: "Secure aggregation", privacy: true, integrity: false, note: "server sees only the sum" },
  { control: "DP + clipping + robust aggregation", privacy: true, integrity: true, note: "layered controls" },
];

export function FederatedThreatMatrix() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid grid-cols-[1.5fr_70px_70px] gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
        <span>design</span>
        <span className="text-center">privacy</span>
        <span className="text-center">integrity</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {ROWS.map((row) => (
          <div key={row.control} className="grid grid-cols-[1.5fr_70px_70px] items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
            <div>
              <p className="text-[10px] font-semibold text-navy">{row.control}</p>
              <p className="text-[8px] text-muted">{row.note}</p>
            </div>
            <span className="flex justify-center">
              {row.privacy ? <EyeOff className="h-4 w-4 text-brand-600" /> : <AlertTriangle className="h-4 w-4 text-gold-600" />}
            </span>
            <span className="flex justify-center">
              {row.integrity ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-gold-600" />}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] leading-4 text-muted">
        <CheckCircle2 className="h-3 w-3" /> Privacy and integrity are separate axes. The right column needs its own controls.
      </p>
    </div>
  );
}
