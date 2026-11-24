import { ArrowDown, KeyRound, LockKeyhole, Database, ShieldCheck } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function KeyHierarchy() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/70 p-3">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
          <ShieldCheck className="h-3.5 w-3.5" /> root of trust · HSM / KMS
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2">
          <KeyRound className="h-4 w-4 text-brand-600" />
          <div>
            <p className="text-[11px] font-bold text-navy">Root key</p>
            <p className="text-[9px] text-muted">never exported · protects key-encryption keys</p>
          </div>
        </div>
      </div>

      <ArrowDown className="mx-auto my-2 h-5 w-5 text-brand-400" />

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { title: "KEK · tenant A", detail: "key-encryption key" },
          { title: "KEK · tenant B", detail: "key-encryption key" },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-brand-200 bg-white p-3">
            <p className="text-[11px] font-bold text-navy">{item.title}</p>
            <p className="text-[9px] text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      <ArrowDown className="mx-auto my-2 h-5 w-5 text-brand-400" />

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { title: "DEK · backups", icon: Database },
          { title: "DEK · records", icon: LockKeyhole },
          { title: "DEK · sessions", icon: KeyRound },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-lg border border-line bg-white p-3">
              <Icon className="h-4 w-4 text-coral-500" />
              <p className="mt-1.5 text-[10px] font-bold text-navy">{item.title}</p>
              <p className="text-[9px] text-muted">data-encryption key</p>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
        rotate, separate by purpose, and audit every unwrap <Cite id="sp800-57pt1r5" locator="§5–6" />
      </p>
    </div>
  );
}
