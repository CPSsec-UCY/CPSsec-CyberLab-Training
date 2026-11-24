"use client";

import { useState } from "react";
import { ArrowRight, Globe2, LockKeyhole, Server, ShieldAlert, ShieldCheck } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type AttackType = "sql" | "xss" | "ssrf" | "traversal";
type DefenceKey = "parameterisedQuery" | "outputEncoding" | "urlAllowlist" | "serverSideAuthorisation";

interface Attack {
  id: AttackType;
  label: string;
  payload: string;
  method: string;
  path: string;
  boundary: string;
  sink: string;
  primaryDefence: DefenceKey;
  vulnerableFlow: string[];
  defendedFlow: string[];
  vulnerableResult: string;
  defendedResult: string;
  mitigation: string;
  owasp: string;
  cwe: string;
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ATTACKS: Attack[] = [
  {
    id: "sql",
    label: "SQL injection",
    payload: "demo' OR '1'='1 --",
    method: "GET",
    path: "/reports/search",
    boundary: "Query string becomes SQL text",
    sink: "Report database",
    primaryDefence: "parameterisedQuery",
    vulnerableFlow: ["Parse tenant as SQL text", "Concatenate value into query", "Database interprets changed grammar", "Tenant filter can be bypassed"],
    defendedFlow: ["Parse tenant as data", "Bind value to a placeholder", "Query grammar remains fixed", "Database returns authorised tenant rows"],
    vulnerableResult: "The toy input changes the query structure, so the tenant predicate no longer has its intended meaning.",
    defendedResult: "The same characters stay inside one bound value. The database does not reinterpret them as SQL syntax.",
    mitigation: "Use parameterised queries for values. Allowlist dynamic identifiers separately and enforce tenant scope in the query.",
    owasp: "OWASP Top 10 · Injection",
    cwe: "CWE-89 · SQL Injection",
  },
  {
    id: "xss",
    label: "Cross-site scripting",
    payload: "<b>demo</b><script>toy()</script>",
    method: "GET",
    path: "/reports/42",
    boundary: "Stored report title becomes HTML",
    sink: "Reviewer browser",
    primaryDefence: "outputEncoding",
    vulnerableFlow: ["Store untrusted report title", "Insert title into an HTML template", "Browser parses markup", "Script runs in the site's origin"],
    defendedFlow: ["Store the original title", "Encode for HTML text context", "Browser renders characters as text", "No executable markup is created"],
    vulnerableResult: "The toy markup reaches an HTML sink and is interpreted as browser instructions.",
    defendedResult: "HTML text encoding preserves the visible characters without creating an element or script.",
    mitigation: "Apply context-specific output encoding at the sink. Sanitise approved rich HTML with a maintained allowlist library.",
    owasp: "OWASP Top 10 · Injection (XSS)",
    cwe: "CWE-79 · Cross-site Scripting",
  },
  {
    id: "ssrf",
    label: "Server-side request forgery",
    payload: "https://api.example.test@internal.example.test/report",
    method: "GET",
    path: "/previews/fetch",
    boundary: "User-supplied URL becomes a server fetch",
    sink: "Outbound HTTP client",
    primaryDefence: "urlAllowlist",
    vulnerableFlow: ["Accept arbitrary destination URL", "Resolve and connect", "Follow redirect without revalidation", "Server reaches an internal service"],
    defendedFlow: ["Parse and canonicalise the URL", "Allowlist scheme, host and port", "Resolve and check destination policy", "Fetch approved origin; revalidate redirects"],
    vulnerableResult: "The toy destination reaches a service the browser could not access directly.",
    defendedResult: "The destination is outside the approved API origin, so the server-side fetch is rejected before connection.",
    mitigation: "Prefer fixed destination identifiers. Validate every redirect, restrict egress and protect against DNS rebinding.",
    owasp: "OWASP · Server-Side Request Forgery guidance",
    cwe: "CWE-918 · SSRF",
  },
  {
    id: "traversal",
    label: "Path traversal",
    payload: "../secrets/demo.txt",
    method: "GET",
    path: "/reports/download",
    boundary: "Relative filename becomes a filesystem path",
    sink: "Report file store",
    primaryDefence: "serverSideAuthorisation",
    vulnerableFlow: ["Accept a relative filename", "Join it to the report root", "Resolve parent-directory segments", "Open a file outside the authorised root"],
    defendedFlow: ["Decode once and canonicalise", "Resolve beneath the report root", "Reject containment failures", "Authorise the resolved object before reading"],
    vulnerableResult: "Parent-directory segments escape the intended report directory in the toy path model.",
    defendedResult: "Canonical containment rejects the escape, and object-level authorisation checks the resolved report.",
    mitigation: "Map opaque IDs to server-side paths, enforce canonical containment and authorise the final object.",
    owasp: "OWASP · File path validation guidance",
    cwe: "CWE-22 · Path Traversal",
  },
];

const DEFENCE_LABELS: Record<DefenceKey, string> = {
  parameterisedQuery: "Parameterised query",
  outputEncoding: "Output encoding",
  urlAllowlist: "URL allowlist",
  serverSideAuthorisation: "Server-side authorisation",
};

const DEFAULT_DEFENCES: Record<DefenceKey, boolean> = {
  parameterisedQuery: true,
  outputEncoding: true,
  urlAllowlist: true,
  serverSideAuthorisation: true,
};

const STAGES = [
  { name: "Request", detail: "The browser sends a syntactically ordinary request. Every value remains untrusted." },
  { name: "Parse", detail: "The application parses the request and creates an internal representation. Parsing is not validation." },
  { name: "Sink", detail: "The value crosses into SQL, HTML, an outbound request or a filesystem path. The sink determines the defence." },
  { name: "Outcome", detail: "Compare the vulnerable and defended traces. A control must change the data or the decision before the sink." },
];

function toyTrigger(attack: AttackType, payload: string) {
  if (attack === "sql") return /\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+|union\s+select|--/i.test(payload);
  if (attack === "xss") return /<[^>]+>|javascript:/i.test(payload);
  if (attack === "ssrf") return /localhost|127\.0\.0\.1|169\.254\.169\.254|internal|\.\./i.test(payload);
  return /(^|[\\/])\.\.([\\/]|$)|%2e|(^|[\\/])secrets?([\\/]|$)/i.test(payload);
}

function DefenceToggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${checked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-emerald-600" />
      {label}
    </label>
  );
}

function FlowTrace({ steps, defended }: { steps: string[]; defended: boolean }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, index) => (
        <li key={step} className="flex items-start gap-2">
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[8px] font-bold ${defended ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {index + 1}
          </span>
          <span className="text-[10px] leading-4 text-body">{step}</span>
          {index < steps.length - 1 ? <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 rotate-90 text-muted" /> : null}
        </li>
      ))}
    </ol>
  );
}

export function WebSecurityLab() {
  const [attackType, setAttackType] = useState<AttackType>("sql");
  const [payload, setPayload] = useState(ATTACKS[0].payload);
  const [defences, setDefences] = useState<Record<DefenceKey, boolean>>(DEFAULT_DEFENCES);
  const [stage, setStage] = useState(0);

  const attack = ATTACKS.find((item) => item.id === attackType) ?? ATTACKS[0];
  const primaryEnabled = defences[attack.primaryDefence];
  const authorisationEnabled = defences.serverSideAuthorisation;
  const triggered = toyTrigger(attack.id, payload);
  const enabledCount = Object.values(defences).filter(Boolean).length;
  const vulnerableOutcome = !authorisationEnabled ? "Bypassed · object policy absent" : triggered ? "Exposed · toy sink reached" : "No toy trigger detected";
  const defendedOutcome = !authorisationEnabled
    ? "Bypassed · authorisation absent"
    : triggered && !primaryEnabled
      ? "Exposed · primary control absent"
      : triggered
        ? "Blocked · control changes the sink"
        : "Allowed · no toy trigger detected";
  const defendedSafe = authorisationEnabled && (!triggered || primaryEnabled);
  const requestTarget = `${attack.path}?payload=${encodeURIComponent(payload || "(empty)")}`;

  function selectAttack(next: AttackType) {
    const selected = ATTACKS.find((item) => item.id === next) ?? ATTACKS[0];
    setAttackType(next);
    setPayload(selected.payload);
    setStage(0);
  }

  function setDefence(key: DefenceKey, checked: boolean) {
    setDefences((current) => ({ ...current, [key]: checked }));
  }

  function reset() {
    setAttackType("sql");
    setPayload(ATTACKS[0].payload);
    setDefences(DEFAULT_DEFENCES);
    setStage(0);
  }

  return (
    <VisualizerShell
      title="Request, trust boundary and defence pipeline"
      description="Safe simulation: payloads are displayed and classified by toy rules; no query, script, URL or file is executed."
      onReset={reset}
      controls={
        <button
          type="button"
          onClick={() => setStage((value) => Math.min(value + 1, STAGES.length - 1))}
          disabled={stage === STAGES.length - 1}
          className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next stage <ArrowRight className="h-3 w-3" />
        </button>
      }
      footer={
        <span>
          <strong className="text-navy">Safe simulation only.</strong> The patterns are deliberately simple teaching heuristics, not a Web Application Firewall, validator or production security test. Missing a toy pattern says nothing about real safety. OWASP categories describe risk families; CWE identifiers name weaknesses, not severity scores. Test real applications only in an authorised environment with reviewed fixtures.
        </span>
      }
    >
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-3 py-2 text-[10px] font-semibold leading-5 text-gold-900">
        Toy payloads · inert display model · no network, database, browser execution or filesystem access.
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Attack family">
        {ATTACKS.map((item) => (
          <StepButton key={item.id} active={attack.id === item.id} done={false} onClick={() => selectAttack(item.id)}>
            {item.label}
          </StepButton>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Pipeline stage">
        {STAGES.map((item, index) => (
          <StepButton key={item.name} active={stage === index} done={index < stage} onClick={() => setStage(index)}>
            {item.name}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_1.35fr] lg:items-stretch">
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700"><Globe2 className="h-3.5 w-3.5" /> Untrusted client zone</p>
          <p className="mt-2 break-all font-mono text-[10px] font-semibold leading-5 text-navy">{attack.method} {requestTarget} HTTP/1.1</p>
          <p className="mt-1 font-mono text-[9px] text-muted">Host: reports.example.test</p>
          <label className="mt-3 block">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Toy payload · editable</span>
            <input
              type="text"
              value={payload}
              maxLength={180}
              onChange={(event) => setPayload(event.target.value)}
              className="mt-1 w-full rounded-lg border border-line bg-white px-2.5 py-2 font-mono text-[10px] text-navy focus:border-brand-300"
              aria-label="Toy payload"
            />
          </label>
          <p className="mt-2 text-[9px] leading-4 text-muted">Encoding changes display form, not trust. Empty and unrecognised payloads are not proof of safety.</p>
        </div>

        <div className="flex items-center justify-center lg:w-24 lg:flex-col">
          <div className="h-px flex-1 border-t border-dashed border-coral-300 lg:h-auto lg:w-px lg:border-t-0 lg:border-l" />
          <div className="mx-2 rounded-lg border border-coral-200 bg-white px-2 py-1.5 text-center text-[8px] font-bold uppercase tracking-[0.1em] text-coral-700 lg:my-2">
            Trust boundary
          </div>
          <div className="h-px flex-1 border-t border-dashed border-coral-300 lg:h-auto lg:w-px lg:border-t-0 lg:border-l" />
        </div>

        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-700"><Server className="h-3.5 w-3.5" /> Application and sink zone</p>
          <p className="mt-2 text-[10px] font-semibold text-navy">{attack.boundary}</p>
          <p className="mt-1 text-[10px] text-muted">Final sink: {attack.sink}</p>
          <div className="mt-3 rounded-lg border border-line bg-white p-2.5" aria-live="polite">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Stage {stage + 1} · {STAGES[stage].name}</p>
            <p className="mt-1 text-[10px] leading-5 text-body">{STAGES[stage].detail}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Defence controls · toggle a control off to model an unsafe deployment</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(DEFENCE_LABELS) as DefenceKey[]).map((key) => (
            <DefenceToggle key={key} label={DEFENCE_LABELS[key]} checked={defences[key]} onChange={(checked) => setDefence(key, checked)} />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Attack family" value={attack.label} />
        <Metric label="Primary defence" value={primaryEnabled ? "Enabled" : "Absent"} tone={primaryEnabled ? "teal" : "rose"} />
        <Metric label="Object authorisation" value={authorisationEnabled ? "Enforced" : "Bypassed"} tone={authorisationEnabled ? "teal" : "rose"} />
        <Metric label="Controls enabled" value={`${enabledCount} / 4`} tone={enabledCount === 4 ? "teal" : "gold"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-rose-700"><ShieldAlert className="h-3.5 w-3.5" /> Vulnerable data flow</p>
            <span className="font-mono text-[9px] font-bold text-rose-700">{vulnerableOutcome}</span>
          </div>
          <div className="mt-3"><FlowTrace steps={attack.vulnerableFlow} defended={false} /></div>
          <p className="mt-3 rounded-lg border border-rose-200 bg-white p-2.5 text-[10px] leading-5 text-body">
            {!authorisationEnabled ? "The handler never establishes a subject or checks permission on the resolved object. Input controls cannot repair missing authorisation." : triggered ? attack.vulnerableResult : "No simple toy signature matched. The unsafe construction remains unsafe; this is not a vulnerability scan."}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Defended data flow</p>
            <span className={`font-mono text-[9px] font-bold ${defendedSafe ? "text-emerald-700" : "text-rose-700"}`}>{defendedOutcome}</span>
          </div>
          <p className="mt-2 text-[9px] font-semibold text-muted">{primaryEnabled ? "Primary control enforced · defended trace active" : "Primary control absent · defended trace shows the intended path only"}</p>
          <div className="mt-3"><FlowTrace steps={attack.defendedFlow} defended /></div>
          <p className="mt-3 rounded-lg border border-emerald-200 bg-white p-2.5 text-[10px] leading-5 text-body">
            {!authorisationEnabled ? "The authorisation control is disabled, so no policy decision protects the resolved object. Query binding, encoding or destination checks cannot repair missing object permission." : triggered && !primaryEnabled ? `The primary defence (${DEFENCE_LABELS[attack.primaryDefence].toLowerCase()}) is absent, so the modelled sink remains exploitable.` : triggered ? attack.defendedResult : "The request reaches the defended sink as ordinary data. Input and business-rule validation still apply."}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={`flex items-start gap-2 rounded-xl border p-3 ${defendedSafe ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`} aria-live="polite">
          {defendedSafe ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          <div className="text-[10px] leading-5">
            <strong>{defendedSafe ? "Defended outcome" : "Defence gap"}: {defendedOutcome}.</strong>{" "}
            {attack.mitigation}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted"><LockKeyhole className="h-3.5 w-3.5 text-brand-600" /> Weakness mapping</p>
          <p className="mt-2 text-[10px] font-semibold text-navy">{attack.owasp}</p>
          <p className="mt-1 text-[10px] text-body">{attack.cwe}</p>
        </div>
      </div>
    </VisualizerShell>
  );
}
