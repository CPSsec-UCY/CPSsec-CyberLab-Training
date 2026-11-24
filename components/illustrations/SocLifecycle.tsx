import { Activity, BookOpen, Crosshair, ShieldCheck, Siren, Wrench } from "lucide-react";

const STEPS = [
  { title: "Prepare", detail: "telemetry, playbooks, access, contacts", icon: ShieldCheck },
  { title: "Detect", detail: "rules, analytics, threat intel", icon: Activity },
  { title: "Analyse", detail: "scope, evidence, identity, timeline", icon: Crosshair },
  { title: "Contain", detail: "isolate, revoke, preserve evidence", icon: Siren },
  { title: "Recover", detail: "eradicate, restore, verify", icon: Wrench },
  { title: "Learn", detail: "review, tune, exercise", icon: BookOpen },
];

export function SocLifecycle() {
  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative rounded-xl border border-line bg-white p-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">0{index + 1}</span>
              <Icon className="mt-1 h-5 w-5 text-brand-600" />
              <p className="mt-1 text-[11px] font-bold text-navy">{step.title}</p>
              <p className="mt-0.5 text-[9px] leading-4 text-muted">{step.detail}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-brand-700">
        feedback from every incident updates detections, playbooks and controls
      </div>
    </div>
  );
}
