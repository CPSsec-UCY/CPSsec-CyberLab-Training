import { ArrowRight, BadgeCheck, Building2, LockKeyhole, Server, ShieldCheck } from "lucide-react";
import { Cite } from "@/components/citations/Cite";

export function PkiChain() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
        {[
          { title: "Root CA", detail: "trust anchor · offline", icon: ShieldCheck },
          { title: "Intermediate CA", detail: "scoped signing", icon: Building2 },
          { title: "Server certificate", detail: "name + public key", icon: Server },
          { title: "Client trust store", detail: "path validation", icon: BadgeCheck },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="contents">
              <div className="rounded-xl border border-line bg-white p-3">
                <Icon className="h-5 w-5 text-brand-600" />
                <p className="mt-1.5 text-[11px] font-bold text-navy">{item.title}</p>
                <p className="text-[9px] leading-4 text-muted">{item.detail}</p>
              </div>
              {index < 3 ? (
                <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-400 lg:block" />
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 p-3 text-[10px] leading-5 text-gold-800">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Each CA certificate signs its child certificate&apos;s public key. The client validates a path to a trust anchor, checking signatures, names, constraints, validity and revocation before trusting the server key. <Cite id="rfc5280" locator="§6" />
      </div>
    </div>
  );
}
