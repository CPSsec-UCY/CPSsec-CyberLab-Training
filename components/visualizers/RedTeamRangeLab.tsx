"use client";

import { useState } from "react";
import { ArrowRight, Crosshair, FileCheck2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type PhaseId = "recon" | "enumeration" | "validation" | "simulation" | "evidence" | "cleanup";
type TargetId = "portal" | "api" | "database";

interface Phase {
  id: PhaseId;
  label: string;
  action: string;
  requirement: string;
}

interface ToyTarget {
  id: TargetId;
  label: string;
  host: string;
  zone: string;
  path: string[];
  objective: string;
  techniques: Record<PhaseId, string>;
  artefacts: Record<PhaseId, string>;
}

interface EvidenceItem {
  id: string;
  phase: PhaseId;
  host: string;
  summary: string;
}

const PHASES: Phase[] = [
  { id: "recon", label: "Recon", action: "Record the approved entry point and baseline response.", requirement: "No prior artefact required." },
  { id: "enumeration", label: "Enumeration", action: "List only the toy services explicitly exposed by the selected target.", requirement: "Recon artefact required." },
  { id: "validation", label: "Validation", action: "Confirm a harmless canary condition without changing production state.", requirement: "Enumeration artefact required." },
  { id: "simulation", label: "Exploitation simulation", action: "Demonstrate impact using a synthetic marker object, never a live exploit.", requirement: "Validation artefact required." },
  { id: "evidence", label: "Evidence", action: "Package the request, response, timestamp and synthetic result.", requirement: "Validation artefact required." },
  { id: "cleanup", label: "Cleanup", action: "Remove toy markers and confirm the authorised test state is restored.", requirement: "Evidence package required." }
];

const TARGETS: ToyTarget[] = [
  {
    id: "portal",
    label: "Demo portal",
    host: "edge.example.test",
    zone: "Public edge",
    path: ["Range client", "Edge gateway", "Demo portal", "Report service"],
    objective: "Synthetic report metadata",
    techniques: {
      recon: "T1595 · Active Scanning",
      enumeration: "T1046 · Network Service Discovery",
      validation: "T1190 · Exploit Public-Facing Application",
      simulation: "T1078 · Valid Accounts",
      evidence: "T1005 · Data from Local System",
      cleanup: "No ATT&CK mapping · defensive cleanup"
    },
    artefacts: {
      recon: "Baseline response and approved host recorded.",
      enumeration: "Two toy routes catalogued with methods and roles.",
      validation: "Canary banner reproduced in the synthetic response.",
      simulation: "Read-only toy marker returned; no code was executed.",
      evidence: "Evidence bundle contains request, response and clock source.",
      cleanup: "Toy marker removed and baseline response restored."
    }
  },
  {
    id: "api",
    label: "Demo API",
    host: "api.example.test",
    zone: "Application tier",
    path: ["Range client", "API gateway", "Token broker", "Synthetic records"],
    objective: "Three synthetic record labels",
    techniques: {
      recon: "T1592 · Gather Victim Host Information",
      enumeration: "T1046 · Network Service Discovery",
      validation: "T1078 · Valid Accounts",
      simulation: "T1552.001 · Credentials in Files",
      evidence: "T1530 · Data from Cloud Storage",
      cleanup: "No ATT&CK mapping · defensive cleanup"
    },
    artefacts: {
      recon: "API description and approved host recorded.",
      enumeration: "Toy token-broker and records routes identified.",
      validation: "Expired toy token is rejected as expected.",
      simulation: "Synthetic marker file is read by the toy broker role.",
      evidence: "Denial and marker-read traces are bundled separately.",
      cleanup: "Temporary toy credential and marker file removed."
    }
  },
  {
    id: "database",
    label: "Demo database",
    host: "db.internal.example.test",
    zone: "Data tier",
    path: ["Range client", "Jump host", "Database role", "Synthetic dataset"],
    objective: "Row count of a synthetic table",
    techniques: {
      recon: "T1595 · Active Scanning",
      enumeration: "T1046 · Network Service Discovery",
      validation: "T1078 · Valid Accounts",
      simulation: "T1213 · Data from Information Repositories",
      evidence: "T1005 · Data from Local System",
      cleanup: "No ATT&CK mapping · defensive cleanup"
    },
    artefacts: {
      recon: "Approved jump-host route and database role recorded.",
      enumeration: "Toy listener and read-only role enumerated.",
      validation: "Write attempt is denied by the synthetic role policy.",
      simulation: "Toy SELECT-equivalent returns a synthetic row count.",
      evidence: "Role policy, denial and read trace are preserved.",
      cleanup: "Temporary toy session closed; dataset checksum unchanged."
    }
  }
];

const INITIAL_ALLOWLIST = ["edge.example.test", "api.example.test", "db.internal.example.test"];
const OUT_OF_SCOPE_HOST = "ops-legacy.example.net";

function parseAllowlist(value: string) {
  return [...new Set(value.split(",").map((entry) => entry.trim().toLowerCase()).filter(Boolean))];
}

function isAllowed(host: string, allowlist: string[]) {
  return allowlist.some((entry) => entry === host || (entry.startsWith("*.") && host.endsWith(entry.slice(1))));
}

export function RedTeamRangeLab() {
  const [targetId, setTargetId] = useState<TargetId>("portal");
  const [scopeDraft, setScopeDraft] = useState(INITIAL_ALLOWLIST.join(", "));
  const [allowlist, setAllowlist] = useState(INITIAL_ALLOWLIST);
  const [outOfScope, setOutOfScope] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [completed, setCompleted] = useState<PhaseId[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [notice, setNotice] = useState("Ready · confirm scope, then advance one phase at a time.");

  const target = TARGETS.find((item) => item.id === targetId) ?? TARGETS[0];
  const phase = PHASES[phaseIndex];
  const destination = outOfScope ? OUT_OF_SCOPE_HOST : target.host;
  const inScope = isAllowed(destination, allowlist);
  const scopeReason = outOfScope
    ? "The out-of-scope neighbour is reserved as unauthorised for this exercise; the toy allowlist cannot approve it."
    : inScope
      ? `${destination} matches the approved toy allowlist.`
      : `${destination} is not covered by the current allowlist.`;
  const blocked = outOfScope || !inScope || allowlist.length === 0;
  const path = outOfScope ? ["Range client", OUT_OF_SCOPE_HOST, "Blocked boundary"] : target.path;
  const decision = blocked
    ? "STOP"
    : phase.id === "cleanup" && completed.includes("cleanup")
      ? "COMPLETE"
      : "CONTINUE";
  const guardrail = blocked
    ? "No probe, enumeration, simulation or evidence action is permitted for this destination."
    : phase.id === "simulation"
      ? "Synthetic markers only. No live exploit, persistence, credential use or destructive action."
      : phase.id === "evidence"
        ? "Collect the minimum toy artefact, redact secrets and preserve original timestamps."
        : phase.id === "cleanup"
          ? "Restore only authorised toy state. Preserve evidence and confirm the baseline."
          : "Maximum five toy probes per phase, approved hours, synthetic data and immediate stop on instability.";

  function resetRun() {
    setTargetId("portal");
    setScopeDraft(INITIAL_ALLOWLIST.join(", "));
    setAllowlist(INITIAL_ALLOWLIST);
    setOutOfScope(false);
    setPhaseIndex(0);
    setCompleted([]);
    setEvidence([]);
    setNotice("Reset · scope and toy evidence cleared. Begin again at recon.");
  }

  function selectTarget(next: TargetId) {
    setTargetId(next);
    setPhaseIndex(0);
    setCompleted([]);
    setEvidence([]);
    setNotice("Target changed · this toy run restarted at recon. Reconfirm scope before proceeding.");
  }

  function applyScope() {
    const next = parseAllowlist(scopeDraft);
    setAllowlist(next);
    setPhaseIndex(0);
    setCompleted([]);
    setEvidence([]);
    setNotice(next.length > 0
      ? `Scope updated to ${next.length} toy entr${next.length === 1 ? "y" : "ies"}. Progress reset to recon.`
      : "Allowlist is empty. All destinations are blocked.");
  }

  function choosePhase(index: number) {
    if (index <= phaseIndex) {
      setPhaseIndex(index);
      setNotice(`Reviewing ${PHASES[index].label.toLowerCase()}. Existing evidence is unchanged.`);
      return;
    }
    setNotice(`Pause · complete ${PHASES[index].requirement.toLowerCase()} Use Next to advance safely.`);
  }

  function advance() {
    if (blocked) {
      setNotice("Stopped · scope check failed. No action was simulated and no evidence was added.");
      return;
    }
    if (!completed.includes(phase.id)) {
      setCompleted((current) => [...current, phase.id]);
      setEvidence((current) => [
        ...current,
        {
          id: `EV-${String(current.length + 1).padStart(2, "0")}`,
          phase: phase.id,
          host: destination,
          summary: target.artefacts[phase.id]
        }
      ]);
    }
    if (phaseIndex === PHASES.length - 1) {
      setNotice("Engagement complete · review the evidence package and confirm cleanup with the range owner.");
      return;
    }
    const next = PHASES[phaseIndex + 1];
    setPhaseIndex((current) => current + 1);
    setNotice(`Completed ${phase.label} for ${destination}. Now at ${next.label}: ${next.action}`);
  }

  return (
    <VisualizerShell
      title="Scoped red-team range simulator"
      description="Select a toy target, enforce an allowlist and advance through six guarded engagement phases."
      onReset={resetRun}
      controls={
        <>
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-muted">Toy target</span>
            <select
              value={targetId}
              onChange={(event) => selectTarget(event.target.value as TargetId)}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-body"
            >
              {TARGETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={advance} className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-[10px]">
            Next phase <ArrowRight className="h-3 w-3" />
          </button>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">Offline toy network only.</strong> No requests leave this page and no exploit code exists here. ATT&amp;CK labels map modelled behaviour for discussion; they do not prove execution. A real engagement requires written authorisation, an approved scope and organisation-specific stop conditions.
        </span>
      }
    >
      <div className="rounded-xl border border-line bg-mist-50 p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Scope allowlist · comma-separated toy hosts</span>
            <input
              type="text"
              value={scopeDraft}
              onChange={(event) => setScopeDraft(event.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-2.5 py-2 font-mono text-[10px] text-navy focus:border-brand-300"
              aria-label="Scope allowlist"
            />
            <span className="mt-1 block text-[9px] text-muted">Exact hosts or a single leading wildcard such as *.example.test. Applying scope restarts the toy run.</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={applyScope} className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[10px] font-bold text-brand-700">
              Apply scope
            </button>
            <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-bold ${outOfScope ? "border-rose-300 bg-rose-50 text-rose-800" : "border-line bg-white text-body"}`}>
              <input type="checkbox" checked={outOfScope} onChange={(event) => {
                setOutOfScope(event.target.checked);
                setNotice(event.target.checked ? "Out-of-scope neighbour selected · the guardrail must stop the engagement." : "Returned to the selected in-scope toy target.");
              }} className="accent-rose-600" />
              Toggle out-of-scope target
            </label>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Engagement phase">
        {PHASES.map((item, index) => (
          <StepButton key={item.id} active={phaseIndex === index} done={completed.includes(item.id)} onClick={() => choosePhase(index)}>
            {item.label}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="Scope decision" value={blocked ? "Blocked" : "Allowed"} tone={blocked ? "rose" : "teal"} />
        <Metric label="Phase progress" value={`${completed.length} / ${PHASES.length}`} tone="gold" />
        <Metric label="Evidence collected" value={evidence.length} />
        <Metric label="Stop / continue" value={decision} tone={decision === "STOP" ? "rose" : decision === "COMPLETE" ? "teal" : "brand"} />
      </div>

      <div className={`mt-4 flex items-start gap-2 rounded-xl border p-3 ${blocked ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} aria-live="polite">
        {blocked ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />}
        <div className="text-[10px] leading-5">
          <strong>{decision} · {scopeReason}</strong> {guardrail}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700"><Crosshair className="h-3.5 w-3.5" /> Modelled attack path</p>
          <ol className="mt-3 flex flex-wrap items-center gap-2">
            {path.map((node, index) => (
              <li key={node} className="flex items-center gap-2">
                <span className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${blocked && index === path.length - 1 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-brand-200 bg-brand-50 text-brand-700"}`}>{node}</span>
                {index < path.length - 1 ? <ArrowRight className="h-3 w-3 text-muted" /> : null}
              </li>
            ))}
          </ol>
          <div className="mt-3 rounded-lg border border-line bg-mist-50 p-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Current phase · {phase.label}</p>
            <p className="mt-1 text-[11px] leading-5 text-body">{blocked ? "Action suppressed by the scope guardrail." : phase.action}</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">{phase.requirement}</p>
          </div>
          <p className="mt-3 text-[10px] text-body"><strong className="text-navy">Objective:</strong> {target.objective} · <strong className="text-navy">Zone:</strong> {target.zone}</p>
          <p className="mt-2 font-mono text-[9px] font-bold text-coral-700">ATT&amp;CK mapping · {target.techniques[phase.id]}</p>
        </div>

        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700"><FileCheck2 className="h-3.5 w-3.5" /> Evidence ledger</p>
          {evidence.length === 0 ? (
            <p className="mt-3 text-[10px] leading-5 text-muted">No artefacts yet. Recon creates the first record. Out-of-scope attempts never add evidence.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {evidence.map((item) => (
                <li key={item.id} className="rounded-lg border border-line bg-white p-2.5">
                  <p className="font-mono text-[9px] font-bold text-brand-700">{item.id} · {item.phase} · {item.host}</p>
                  <p className="mt-1 text-[10px] leading-4 text-body">{item.summary}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-gold-200 bg-gold-50 p-3 text-[10px] leading-5 text-gold-900" aria-live="polite">
        <strong className="text-navy">Range controller:</strong> {notice}
      </div>
    </VisualizerShell>
  );
}
