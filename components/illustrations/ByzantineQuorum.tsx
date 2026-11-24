import { CheckCircle2, XCircle } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

const REPLICAS = [
  { id: "R1", honest: true },
  { id: "R2", honest: true },
  { id: "R3", honest: true },
  { id: "R4", honest: false },
];

export function ByzantineQuorum() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          n = 4 replicas · f = 1 Byzantine
        </p>
        <p className="font-mono text-[10px] text-muted">n ≥ 3f + 1</p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {REPLICAS.map((replica) => (
          <div key={replica.id} className={`rounded-xl border p-3 text-center ${replica.honest ? "border-emerald-200 bg-white" : "border-rose-200 bg-rose-50"}`}>
            {replica.honest ? <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" /> : <XCircle className="mx-auto h-5 w-5 text-rose-600" />}
            <p className="mt-1 text-[10px] font-bold text-navy">{replica.id}</p>
            <p className={`text-[8px] font-semibold uppercase tracking-[0.08em] ${replica.honest ? "text-emerald-700" : "text-rose-700"}`}>
              {replica.honest ? "honest" : "byzantine"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">quorum A</p>
          <p className="mt-1 font-mono text-[10px] text-navy">R1 · R2 · R3</p>
        </div>
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700">quorum B</p>
          <p className="mt-1 font-mono text-[10px] text-navy">R2 · R3 · R4</p>
        </div>
      </div>
      <p className="mt-2 text-center text-[9px] leading-4 text-muted">
        The quorums overlap in two replicas, including at least one honest replica. That overlap prevents two conflicting decisions. <Cite id="castro-liskov1999" locator="§1–4" />
      </p>
    </div>
  );
}
