"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LENSES } from "@/lib/lenses";

const SAMPLES = [
  {
    level: 1 as const,
    headline: "A password spray is hitting the VPN",
    body: "Users are seeing failed logins, then a few succeed from unfamiliar addresses. The attacker is not breaking encryption; they are reusing leaked passwords against a public login portal. The defender needs visibility, containment and a way to tell a real takeover from a noisy scanner.",
    bullets: ["Attacker goal: one valid account", "Defender goal: detect, contain, notify", "No maths required"],
  },
  {
    level: 2 as const,
    headline: "Telemetry, detection, triage, containment",
    body: "VPN logs, identity-provider events, EDR telemetry and DNS records land in the SIEM. A detection correlates failed authentications across accounts, then flags a successful login from a new ASN. The analyst validates the asset, checks impossible travel, disables sessions, rotates credentials and opens an incident.",
    bullets: ["Normalise timestamps and identities", "Correlate across identity, VPN and endpoint", "Contain without destroying evidence"],
  },
  {
    level: 3 as const,
    headline: "Base rates decide whether the alert matters",
    body: "A detection is a classifier. Its operational value depends on prevalence, false-positive rate and cost. If credential stuffing attempts are common but successful takeovers are rare, a rule with 99% accuracy can still be mostly noise. Detection engineering uses likelihood ratios, ROC/PR analysis and explicit assumptions about attacker behaviour.",
    bullets: ["Precision/recall over raw accuracy", "Base-rate fallacy in alert queues", "Document assumptions and thresholds"],
  },
  {
    level: 4 as const,
    headline: "The pipeline is the product",
    body: "Collectors must handle clock skew, parsing failures, PII, retention and backpressure. The SIEM must enrich at query time without collapsing under volume. Endpoint isolation needs a tested playbook. An alert that fires after the attacker has moved laterally is a monitoring gap, not a detection win.",
    bullets: ["Schema and time normalisation", "Retention, privacy and cost", "Tested containment and rollback"],
  },
];

export function DepthDemo() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const sample = SAMPLES.find((item) => item.level === level) ?? SAMPLES[0];
  const meta = LENSES.find((item) => item.level === level) ?? LENSES[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex flex-wrap gap-2 border-b border-line bg-mist-50 p-3">
        {LENSES.map((lens) => {
          const active = lens.level === level;
          return (
            <button
              key={lens.level}
              type="button"
              onClick={() => setLevel(lens.level)}
              aria-pressed={active}
              className={`flex-1 rounded-xl border px-3 py-2 text-left transition sm:min-w-[140px] ${
                active ? `${lens.accentBorder} ${lens.accentBg} shadow-sm` : "border-line bg-white hover:border-brand-200"
              }`}
            >
              <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${active ? lens.accentText : "text-muted"}`}>
                L{lens.level} · {lens.short}
              </span>
              <span className={`mt-0.5 block text-[11px] font-semibold ${active ? "text-navy" : "text-body"}`}>
                {lens.audience.split(",")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${meta.accentText}`}>{meta.name}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-navy">{sample.headline}</h3>
            <p className="mt-3 text-sm leading-7 text-body">{sample.body}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {sample.bullets.map((bullet) => (
                <li key={bullet} className="rounded-xl border border-line bg-mist-50 px-3 py-2 text-[11px] leading-5 text-body">
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="border-t border-line bg-mist-50 px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
        Same incident · four audiences · citations preserved across the switch
      </div>
    </div>
  );
}
