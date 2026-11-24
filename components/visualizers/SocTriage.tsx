"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, RotateCcw, ShieldAlert } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  source: string;
  technique: string;
  evidence: string;
  positive: boolean;
  explanation: string;
}

const ALERTS: Alert[] = [
  {
    id: "A-1042",
    title: "Impossible travel followed by a successful MFA login",
    severity: "High",
    source: "Identity provider",
    technique: "T1078 · Valid Accounts",
    evidence:
      "Six failed push notifications in four minutes, then an approved push from an IP in a different country. The user has not travelled and the device fingerprint is new.",
    positive: true,
    explanation:
      "MFA fatigue plus a new device and impossible travel is a credible account takeover. Contain the session, revoke tokens, contact the user and review mailbox and cloud audit logs.",
  },
  {
    id: "A-1043",
    title: "Port scan from the vulnerability scanner",
    severity: "Low",
    source: "Firewall",
    technique: "T1046 · Network Service Discovery",
    evidence:
      "The source 10.0.2.15 is the authenticated scanner, the scan matches the weekly change window, and the target inventory matches the approved scope.",
    positive: false,
    explanation:
      "This is expected scanner traffic. Verify the scan ID and scope, then tune the detection to exclude the authenticated scanner rather than the whole source range.",
  },
  {
    id: "A-1044",
    title: "Encoded PowerShell spawned by a spreadsheet",
    severity: "Critical",
    source: "EDR",
    technique: "T1059.001 · PowerShell",
    evidence:
      "EXCEL.EXE spawned powershell.exe with an encoded command, disabled AMSI in the command line, and contacted a newly registered domain. The workstation is in finance.",
    positive: true,
    explanation:
      "This chain strongly suggests macro execution and defence evasion. Isolate the endpoint, capture volatile evidence, hunt for lateral movement and block the domain across proxies and DNS.",
  },
  {
    id: "A-1045",
    title: "High-volume DNS queries to a major CDN",
    severity: "Medium",
    source: "DNS",
    technique: "T1071.004 · DNS",
    evidence:
      "The query volume is high but the destination is a well-known CDN used by the line-of-business app, and the pattern matches the application's normal behaviour after a deployment.",
    positive: false,
    explanation:
      "Volume alone is not malicious. Correlate with asset ownership, deployment events and query entropy. A false positive here should tune the baseline, not disable DNS monitoring.",
  },
];

const SEVERITY_STYLES: Record<Alert["severity"], string> = {
  Critical: "border-rose-200 bg-rose-50 text-rose-700",
  High: "border-coral-200 bg-coral-50 text-coral-700",
  Medium: "border-gold-200 bg-gold-50 text-gold-700",
  Low: "border-blue-200 bg-blue-50 text-blue-700",
};

export function SocTriage() {
  const [index, setIndex] = useState(0);
  const [decision, setDecision] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const alert = ALERTS[index];
  const correct = decision !== null && decision === alert.positive;
  const finished = answered === ALERTS.length;

  function answer(positive: boolean) {
    if (decision !== null) return;
    setDecision(positive);
    setAnswered((value) => value + 1);
    if (positive === alert.positive) setScore((value) => value + 1);
  }

  function next() {
    if (index + 1 < ALERTS.length) {
      setIndex(index + 1);
      setDecision(null);
    }
  }

  function reset() {
    setIndex(0);
    setDecision(null);
    setScore(0);
    setAnswered(0);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          <ShieldAlert className="h-3.5 w-3.5 text-brand-600" /> alert {index + 1} of {ALERTS.length}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-body">{score} correct / {answered} answered</span>
          <button type="button" onClick={reset} className="btn-ghost px-2.5 py-1.5 text-[10px]"><RotateCcw className="h-3 w-3" /> Reset</button>
        </div>
      </div>

      {!finished ? (
        <>
          <div className="mt-3 rounded-xl border border-line bg-mist-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-brand-700">{alert.id}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${SEVERITY_STYLES[alert.severity]}`}>{alert.severity}</span>
              <span className="chip">{alert.source}</span>
              <span className="chip">{alert.technique}</span>
            </div>
            <h3 className="mt-2 text-sm font-bold text-navy">{alert.title}</h3>
            <p className="mt-2 text-xs leading-5 text-body">{alert.evidence}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => answer(true)} disabled={decision !== null} className={`rounded-xl border px-4 py-2 text-[11px] font-semibold ${decision === true ? "border-rose-300 bg-rose-50 text-rose-700" : "border-line bg-white text-body hover:border-rose-200"}`}>
              True positive — investigate &amp; contain
            </button>
            <button type="button" onClick={() => answer(false)} disabled={decision !== null} className={`rounded-xl border px-4 py-2 text-[11px] font-semibold ${decision === false ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-line bg-white text-body hover:border-emerald-200"}`}>
              False positive — tune &amp; close
            </button>
          </div>

          {decision !== null ? (
            <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 ${correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              {correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${correct ? "text-emerald-700" : "text-rose-700"}`}>
                  {correct ? "Good call" : "Reconsider"} · {alert.positive ? "true positive" : "false positive"}
                </p>
                <p className="mt-1 text-xs leading-5 text-body">{alert.explanation}</p>
                {index + 1 < ALERTS.length ? (
                  <button type="button" onClick={next} className="btn-primary mt-3 px-3 py-1.5 text-[10px]">
                    Next alert <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button type="button" onClick={reset} className="btn-ghost mt-3 px-3 py-1.5 text-[10px]">Restart queue</button>
                )}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">Triage complete</p>
          <p className="mt-2 text-3xl font-bold text-navy">{score}/{ALERTS.length}</p>
          <p className="mt-2 text-sm text-body">
            Real SOC work needs context, asset ownership, threat intelligence and a documented decision.
            A detection is only useful if an analyst can act on it.
          </p>
          <button type="button" onClick={reset} className="btn-primary mt-5">Try again</button>
        </div>
      )}

      <p className="mt-3 text-[11px] leading-5 text-muted">
        Triage is a judgement call under uncertainty. The explanations model a defensible decision, not a
        universal ground truth; production playbooks should include escalation and evidence preservation.
      </p>
    </div>
  );
}
