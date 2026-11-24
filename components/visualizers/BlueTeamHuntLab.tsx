"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Crosshair, Database, Radar, ShieldAlert, TerminalSquare } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type SourceKey = "identity" | "endpoint" | "dns" | "network";
type HypothesisKey = "identity" | "powershell" | "dns";
type ResponseKey = "monitor" | "isolate" | "revoke" | "block" | "escalate";

interface HuntEvent {
  id: string;
  time: string;
  source: SourceKey;
  host: string;
  user: string;
  summary: string;
  score: number;
  malicious: boolean;
  techniques: string[];
}

interface Technique {
  id: string;
  name: string;
  sources: SourceKey[];
  evidence: string;
}

interface Hunt {
  id: HypothesisKey;
  label: string;
  hypothesis: string;
  question: string;
  sources: SourceKey[];
  defaultSources: SourceKey[];
  defaultThreshold: number;
  baselineMatches: number;
  baselineRate: string;
  medianVolume: string;
  techniques: Technique[];
  events: HuntEvent[];
  refuting: string;
}

const SOURCE_META: Record<SourceKey, { label: string; detail: string }> = {
  identity: { label: "Identity", detail: "Sign-ins, MFA, token and device-enrolment events" },
  endpoint: { label: "Endpoint", detail: "Process creation, command lines and file events" },
  dns: { label: "DNS", detail: "Query names, response codes, client and time" },
  network: { label: "Network", detail: "Flow direction, destination, bytes and connection state" },
};

const SOURCE_KEYS = Object.keys(SOURCE_META) as SourceKey[];

const HUNTS: Hunt[] = [
  {
    id: "identity",
    label: "Valid-account misuse after a new sign-in",
    hypothesis: "An attacker used valid credentials from a new device, generated MFA failures and then accessed sensitive resources.",
    question: "Does identity behaviour corroborate a new-device sign-in with endpoint activity, rather than relying on geography alone?",
    sources: ["identity", "endpoint"],
    defaultSources: ["identity", "endpoint"],
    defaultThreshold: 75,
    baselineMatches: 5,
    baselineRate: "18% of sign-in sessions",
    medianVolume: "2,400 sessions / day",
    refuting: "Approved travel, a documented device replacement, VPN egress changes and normal service-account backup activity can produce similar identity signals.",
    techniques: [
      { id: "T1078", name: "Valid Accounts", sources: ["identity"], evidence: "Successful authentication for the affected identity from an unusual device or network." },
      { id: "T1110", name: "Brute Force", sources: ["identity"], evidence: "Repeated failed authentication or MFA prompts followed by success." },
      { id: "T1550", name: "Use Alternate Authentication Material", sources: ["identity", "endpoint"], evidence: "Token reuse or session activity from a second endpoint." },
      { id: "T1078.002", name: "Domain Accounts", sources: ["identity", "endpoint"], evidence: "Domain sign-in correlated with suspicious process or resource access." },
    ],
    events: [
      { id: "ID-01", time: "02:11:04", source: "identity", host: "VPN-GW-02", user: "finance17", summary: "Successful interactive sign-in · new device · new country · six prior MFA denials", score: 96, malicious: true, techniques: ["T1078", "T1110"] },
      { id: "ID-02", time: "02:14:22", source: "endpoint", host: "WORKSTATION-17", user: "finance17", summary: "New device opens payroll share and creates a staged archive", score: 84, malicious: true, techniques: ["T1078.002"] },
      { id: "ID-03", time: "08:30:10", source: "identity", host: "SSO-EDGE", user: "analyst4", summary: "VPN egress country changed · approved travel record and managed device", score: 44, malicious: false, techniques: [] },
      { id: "ID-04", time: "01:00:00", source: "identity", host: "SSO-EDGE", user: "svc_backup", summary: "Service account signs in from scheduled backup runner in a new ASN", score: 35, malicious: false, techniques: [] },
      { id: "ID-05", time: "13:06:31", source: "identity", host: "SSO-EDGE", user: "jkim", summary: "Four failed push prompts then success · device fingerprint previously unseen", score: 88, malicious: true, techniques: ["T1110", "T1078"] },
      { id: "ID-06", time: "17:42:18", source: "identity", host: "SSO-EDGE", user: "mlee", summary: "Password-manager synchronisation from a newly registered browser", score: 28, malicious: false, techniques: [] },
      { id: "ID-07", time: "11:20:03", source: "identity", host: "SSO-EDGE", user: "ops9", summary: "Geolocation changed but endpoint security posture is compliant", score: 55, malicious: false, techniques: [] },
      { id: "ID-08", time: "15:01:40", source: "endpoint", host: "WORKSTATION-31", user: "admin2", summary: "Same session token observed from a second host within two minutes", score: 95, malicious: true, techniques: ["T1550"] },
      { id: "ID-09", time: "04:12:11", source: "identity", host: "SSO-EDGE", user: "former_contractor", summary: "Dormant privileged account becomes active and accesses a legacy portal", score: 69, malicious: true, techniques: ["T1078"] },
      { id: "ID-10", time: "09:03:12", source: "identity", host: "SSO-EDGE", user: "alice", summary: "Single sign-in from a compliant laptop during normal hours", score: 22, malicious: false, techniques: [] },
    ],
  },
  {
    id: "powershell",
    label: "Office application spawning encoded PowerShell",
    hypothesis: "A document or script host launched hidden encoded PowerShell that then performed suspicious network or discovery activity.",
    question: "Does the complete parent-child chain distinguish malicious execution from approved administrative automation?",
    sources: ["endpoint", "identity"],
    defaultSources: ["endpoint", "identity"],
    defaultThreshold: 75,
    baselineMatches: 6,
    baselineRate: "9% of PowerShell launches",
    medianVolume: "620 launches / day",
    refuting: "Signed deployment tooling, documented report scripts and service accounts can use encoded commands. Check signer, deployment change, parent and command semantics.",
    techniques: [
      { id: "T1204.002", name: "Malicious File", sources: ["endpoint", "identity"], evidence: "User context launches a document-associated executable on a workstation." },
      { id: "T1059.001", name: "PowerShell", sources: ["endpoint"], evidence: "PowerShell is created by an unexpected parent with hidden or encoded arguments." },
      { id: "T1027", name: "Obfuscated Files or Information", sources: ["endpoint"], evidence: "Encoded or heavily obfuscated command line appears in process telemetry." },
      { id: "T1071.001", name: "Web Protocols", sources: ["endpoint", "network"], evidence: "The suspicious child initiates an outbound web-protocol connection." },
    ],
    events: [
      { id: "PS-01", time: "10:07:04", source: "endpoint", host: "WORKSTATION-22", user: "erin", summary: "WINWORD.EXE → powershell.exe · -nop -w hidden -enc · new destination", score: 97, malicious: true, techniques: ["T1204.002", "T1059.001", "T1027"] },
      { id: "PS-02", time: "11:32:19", source: "endpoint", host: "WORKSTATION-08", user: "bob", summary: "EXCEL.EXE → powershell.exe · DownloadString · unsigned script host", score: 91, malicious: true, techniques: ["T1204.002", "T1059.001"] },
      { id: "PS-03", time: "15:18:44", source: "endpoint", host: "WORKSTATION-41", user: "svc_monitor", summary: "WSCRIPT.EXE → hidden PowerShell · encoded command outside approved job", score: 86, malicious: true, techniques: ["T1059.001", "T1027"] },
      { id: "PS-04", time: "02:00:03", source: "endpoint", host: "WORKSTATION-31", user: "svc_monitor", summary: "Encoded health check · signed automation · matches approved schedule", score: 72, malicious: false, techniques: [] },
      { id: "PS-05", time: "09:45:16", source: "endpoint", host: "WORKSTATION-12", user: "admin2", summary: "EXPLORER.EXE → PowerShell · approved reporting script · signed", score: 61, malicious: false, techniques: [] },
      { id: "PS-06", time: "14:02:10", source: "endpoint", host: "WORKSTATION-19", user: "alice", summary: "OUTLOOK.EXE → mshta.exe · unrelated binary-hosting behaviour", score: 53, malicious: false, techniques: [] },
      { id: "PS-07", time: "16:55:27", source: "endpoint", host: "WORKSTATION-54", user: "heidi", summary: "PowerShell child creates WMI subscription and outbound HTTPS session", score: 94, malicious: true, techniques: ["T1059.001", "T1071.001"] },
      { id: "PS-08", time: "07:15:00", source: "endpoint", host: "WORKSTATION-06", user: "svc_update", summary: "Signed update script · vendor path · normal maintenance window", score: 39, malicious: false, techniques: [] },
      { id: "PS-09", time: "12:11:05", source: "endpoint", host: "WORKSTATION-33", user: "dev7", summary: "Python test runner · no PowerShell command line", score: 31, malicious: false, techniques: [] },
      { id: "PS-10", time: "08:01:20", source: "identity", host: "SSO-EDGE", user: "grace", summary: "Routine managed-device sign-in with no endpoint anomaly", score: 20, malicious: false, techniques: [] },
    ],
  },
  {
    id: "dns",
    label: "Low-variability DNS beacon from a workstation",
    hypothesis: "A compromised workstation resolves algorithmically generated names or beacons at stable intervals to an unusual destination.",
    question: "Do query structure, timing and network attribution separate beaconing from legitimate software update and telemetry traffic?",
    sources: ["dns", "network"],
    defaultSources: ["dns", "network"],
    defaultThreshold: 75,
    baselineMatches: 5,
    baselineRate: "3% of workstation query volume",
    medianVolume: "86,000 queries / day",
    refuting: "Content delivery networks, SaaS provisioning, security tooling and monitored appliances generate bursts, long names and repeated intervals without malicious intent.",
    techniques: [
      { id: "T1071.004", name: "DNS", sources: ["dns", "network"], evidence: "Workstation DNS traffic is attributed to an unusual outbound destination." },
      { id: "T1568.002", name: "Domain Generation Algorithms", sources: ["dns"], evidence: "Many unique, structurally similar names under a newly observed parent." },
      { id: "T1027", name: "Obfuscated Files or Information", sources: ["dns"], evidence: "Encoded or high-entropy labels appear in repeated query patterns." },
      { id: "T1041", name: "Exfiltration Over C2 Channel", sources: ["dns", "network"], evidence: "Query sequence aligns with sustained outbound traffic and unusual bytes." },
    ],
    events: [
      { id: "DNS-01", time: "03:02:01", source: "dns", host: "WORKSTATION-17", user: "finance17", summary: "NXDOMAIN · 27-character random label · parent first seen six hours ago", score: 94, malicious: true, techniques: ["T1568.002", "T1027"] },
      { id: "DNS-02", time: "03:03:01", source: "dns", host: "WORKSTATION-17", user: "finance17", summary: "Same parent · changed random label · interval 60s ± 0s", score: 91, malicious: true, techniques: ["T1071.004", "T1568.002"] },
      { id: "DNS-03", time: "03:04:01", source: "network", host: "WORKSTATION-17", user: "finance17", summary: "Outbound TLS flow to 198.51.100.24 · 2.1 KiB every 60 seconds", score: 89, malicious: true, techniques: ["T1071.004"] },
      { id: "DNS-04", time: "16:00:10", source: "dns", host: "WORKSTATION-09", user: "dev3", summary: "Burst of long CDN names · deployment event · known provider", score: 57, malicious: false, techniques: [] },
      { id: "DNS-05", time: "05:05:10", source: "dns", host: "WORKSTATION-44", user: "svc_edr", summary: "Rapid distinct subdomains · approved monitoring provider", score: 45, malicious: false, techniques: [] },
      { id: "DNS-06", time: "13:12:00", source: "dns", host: "WORKSTATION-28", user: "ops9", summary: "SaaS endpoint churn after service failover · known tenant", score: 74, malicious: false, techniques: [] },
      { id: "DNS-07", time: "03:10:00", source: "network", host: "WORKSTATION-17", user: "finance17", summary: "Sustained upload aligned with DNS query sequence · destination unapproved", score: 93, malicious: true, techniques: ["T1041", "T1071.004"] },
      { id: "DNS-08", time: "01:30:00", source: "dns", host: "WORKSTATION-03", user: "svc_backup", summary: "Resolver timeout and retries during approved backup", score: 34, malicious: false, techniques: [] },
      { id: "DNS-09", time: "20:20:00", source: "dns", host: "IOT-07", user: "device", summary: "Fixed 300-second telemetry · inventoried appliance · known vendor", score: 66, malicious: false, techniques: [] },
      { id: "DNS-10", time: "09:00:05", source: "network", host: "WORKSTATION-11", user: "alice", summary: "Normal outbound web session · approved destination · regular bytes", score: 23, malicious: false, techniques: [] },
    ],
  },
];

const RESPONSES: Record<ResponseKey, { label: string; detail: string }> = {
  monitor: { label: "Collect, preserve and monitor", detail: "Record the query, preserve relevant evidence and continue observation without disruptive action." },
  isolate: { label: "Isolate affected endpoint", detail: "Apply a scoped endpoint isolation action after authorisation, with business fallback and rollback." },
  revoke: { label: "Revoke sessions and rotate credentials", detail: "Invalidate affected sessions and rotate exposed credentials while preserving authentication audit logs." },
  block: { label: "Block destination at DNS and proxy", detail: "Apply an approved destination block and monitor for alternate infrastructure or fallback channels." },
  escalate: { label: "Open an incident and escalate", detail: "Assign an incident lead, notify asset owners and expand scope using independent telemetry." },
};

const COMMANDS: { source: SourceKey; title: string; command: string; scope: string }[] = [
  {
    source: "identity",
    title: "Windows authentication events",
    command: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625} -MaxEvents 200 | Select-Object TimeCreated, Id, Message",
    scope: "Authorised Windows host only. Reads local Security events; adapt the event IDs for the deployed audit policy.",
  },
  {
    source: "endpoint",
    title: "Sysmon process creation",
    command: "Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; Id=1} -MaxEvents 200 | Select-Object TimeCreated, Message",
    scope: "Requires Sysmon. Reads process-creation records; do not enable or change logging during an unapproved hunt.",
  },
  {
    source: "dns",
    title: "Windows DNS client events",
    command: "Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-DNS-Client/Operational'} -MaxEvents 200 | Select-Object TimeCreated, Id, Message",
    scope: "Reads local client events. Central DNS resolver logs usually provide broader query-name and response-code coverage.",
  },
  {
    source: "network",
    title: "Current TCP connections",
    command: "Get-NetTCPConnection | Sort-Object State, RemoteAddress",
    scope: "Read-only snapshot of current connections. A live socket does not reveal historical payloads or prove ownership of the remote endpoint.",
  },
  {
    source: "identity",
    title: "Linux authentication journal",
    command: "journalctl --since '2 hours ago' --no-pager",
    scope: "Authorised Linux host only. Reads the local journal; the analyst needs permission to view authentication records.",
  },
];

function percent(numerator: number, denominator: number) {
  return denominator === 0 ? "—" : `${Math.round((numerator / denominator) * 100)}%`;
}

function resetForHunt(hunt: Hunt) {
  return {
    sources: [...hunt.defaultSources],
    threshold: hunt.defaultThreshold,
    hasRun: false,
    mapped: false,
    response: "monitor" as ResponseKey,
    guidance: "Select data sources, run the query, then compare precision, recall and coverage before choosing a response.",
  };
}

export function BlueTeamHuntLab() {
  const [huntIndex, setHuntIndex] = useState(0);
  const hunt = HUNTS[huntIndex];
  const [sources, setSources] = useState<SourceKey[]>([...hunt.defaultSources]);
  const [threshold, setThreshold] = useState(hunt.defaultThreshold);
  const [hasRun, setHasRun] = useState(false);
  const [mapped, setMapped] = useState(false);
  const [response, setResponse] = useState<ResponseKey>("monitor");
  const [guidance, setGuidance] = useState("Select data sources, run the query, then compare precision, recall and coverage before choosing a response.");

  const visibleEvents = hunt.events.filter((event) => sources.includes(event.source));
  const evaluated = visibleEvents.map((event) => ({ ...event, matched: event.score >= threshold }));
  const matched = evaluated.filter((event) => event.matched);
  const truePositives = matched.filter((event) => event.malicious).length;
  const falsePositives = matched.length - truePositives;
  const positives = hunt.events.filter((event) => event.malicious).length;
  const falseNegatives = positives - truePositives;
  const baselineEvents = visibleEvents.filter((event) => event.score >= 30);
  const baselineFalsePositives = baselineEvents.filter((event) => !event.malicious).length;
  const falsePositiveReduction = baselineFalsePositives === 0 ? 0 : Math.round(((baselineFalsePositives - falsePositives) / baselineFalsePositives) * 100);
  const sourceCoverage = Math.round((hunt.sources.filter((source) => sources.includes(source)).length / hunt.sources.length) * 100);
  const coveredTechniques = mapped
    ? hunt.techniques.filter((technique) => technique.sources.every((source) => sources.includes(source)) && matched.some((event) => event.techniques.includes(technique.id)))
    : [];
  const coverage = Math.round((coveredTechniques.length / hunt.techniques.length) * 100);
  const precision = matched.length > 0 ? truePositives / matched.length : 0;
  const recall = positives > 0 ? truePositives / positives : 0;
  const query = [
    `events(source in [${sources.map((source) => `"${source}"`).join(", ")}])`,
    `| where hypothesis == "${hunt.id}"`,
    "| extend risk_score = baseline_deviation + rarity + sequence + asset_context",
    `| where risk_score >= ${threshold}`,
    "| project timestamp, host, user, source, summary, risk_score, evidence_ref",
  ].join("\n");

  function toggleSource(source: SourceKey) {
    setSources((current) => current.includes(source) ? current.filter((entry) => entry !== source) : [...current, source]);
    setHasRun(false);
    setMapped(false);
    setGuidance("Data-source selection changed. Re-run the query; coverage and recall now reflect only the selected telemetry.");
  }

  function runQuery() {
    if (sources.length === 0) {
      setGuidance("No data source is selected, so the query cannot execute. Select at least one source before running it.");
      return;
    }
    setHasRun(true);
    setGuidance("Query executed against the deterministic fixture. Raise or lower the threshold and observe the precision/recall trade-off; a quiet queue can still conceal missed attacks.");
  }

  function mapAttack() {
    if (!hasRun) {
      setGuidance("Run the query before mapping ATT&CK. Technique coverage must be tied to observed evidence, not to a generic technique label.");
      return;
    }
    setMapped(true);
    setGuidance("ATT&CK mappings are evidence-linked. Coverage counts only techniques whose required sources are selected and whose behaviour appears in a match.");
  }

  function chooseResponse(value: ResponseKey) {
    setResponse(value);
    setGuidance("Response selected. Review the decision panel for scope, evidence and guardrails; this toy exercise performs no containment action.");
  }

  function nextHunt() {
    const nextIndex = (huntIndex + 1) % HUNTS.length;
    const next = HUNTS[nextIndex];
    setHuntIndex(nextIndex);
    const reset = resetForHunt(next);
    setSources(reset.sources);
    setThreshold(reset.threshold);
    setHasRun(reset.hasRun);
    setMapped(reset.mapped);
    setResponse(reset.response);
    setGuidance(reset.guidance);
  }

  function reset() {
    const initial = resetForHunt(HUNTS[0]);
    setHuntIndex(0);
    setSources(initial.sources);
    setThreshold(initial.threshold);
    setHasRun(initial.hasRun);
    setMapped(initial.mapped);
    setResponse(initial.response);
    setGuidance(initial.guidance);
  }

  let decisionTitle = "Response decision pending";
  let decisionText = "Run the query and map supported behaviour before selecting a containment or escalation action.";
  if (hasRun) {
    if (matched.length === 0) {
      decisionTitle = "Zero matches · verify visibility";
      decisionText = "Do not treat a quiet result as a clean environment. Check source freshness, parser coverage and the threshold; consider broadening the hypothesis or adding independent telemetry.";
    } else if (truePositives === 0) {
      decisionTitle = "False positives only · do not contain";
      decisionText = `All ${matched.length} toy matches are benign in the labelled fixture. Tune the baseline or add corroborating predicates before using this query for disruptive response.`;
    } else if (precision < 0.6) {
      decisionTitle = "Investigation required · precision below 60%";
      decisionText = `${truePositives} of ${matched.length} toy matches are malicious. Investigate and add context before disruptive action; the chosen response would affect benign activity at this precision.`;
    } else if (recall < 0.6) {
      decisionTitle = "Partial detection · preserve and expand scope";
      decisionText = `The selected query finds ${truePositives} of ${positives} labelled malicious events. ${RESPONSES[response].detail} First expand telemetry because a low-recall response path can miss part of the same activity.`;
    } else {
      decisionTitle = `${RESPONSES[response].label} · authorised toy decision`;
      decisionText = `${truePositives} of ${matched.length} toy matches are malicious and recall is ${percent(truePositives, positives)}. ${RESPONSES[response].detail} Record approval, scope, evidence references, timestamp and rollback before acting.`;
    }
  }

  return (
    <VisualizerShell
      title="Threat-hunting and detection workbench"
      description="Test a hypothesis, tune a deterministic detection and justify a response against labelled toy events."
      onReset={reset}
      controls={
        <>
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-muted">Choose hypothesis</span>
            <select
              value={hunt.id}
              onChange={(event) => {
                const next = HUNTS.find((candidate) => candidate.id === event.target.value)!;
                setHuntIndex(HUNTS.indexOf(next));
                const initial = resetForHunt(next);
                setSources(initial.sources);
                setThreshold(initial.threshold);
                setHasRun(initial.hasRun);
                setMapped(initial.mapped);
                setResponse(initial.response);
                setGuidance(initial.guidance);
              }}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-body"
            >
              {HUNTS.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}
            </select>
          </label>
          <StepButton active={hasRun} done={hasRun} onClick={runQuery}>Run query</StepButton>
          <StepButton active={mapped} done={mapped} onClick={mapAttack}>Map ATT&amp;CK</StepButton>
          <StepButton active={false} done={false} onClick={nextHunt}>Next hunt <ArrowRight className="ml-1 inline h-3 w-3" /></StepButton>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">Toy evaluation:</strong> all events, users, hosts, scores and labels are fictional. Precision = TP / (TP + FP); recall = TP / (TP + FN); false-positive reduction compares the current threshold with threshold 30 using the same selected sources. Hidden labels are used only for teaching metrics. Production estimates need reviewed incidents, benign fixtures, red-team tests and confidence intervals. ATT&CK mapping describes observed behaviour, not attribution.
        </span>
      }
    >
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700"><Radar className="h-3.5 w-3.5" /> Hunt {huntIndex + 1} / {HUNTS.length}</p>
          <span className="font-mono text-[9px] text-brand-700">fixture {hunt.id.toUpperCase()}-10</span>
        </div>
        <h4 className="mt-2 text-sm font-bold text-navy">{hunt.label}</h4>
        <p className="mt-1 text-[11px] leading-5 text-body">{hunt.hypothesis}</p>
        <p className="mt-2 text-[9px] leading-4 text-muted"><strong className="text-navy">Decision question:</strong> {hunt.question}</p>
      </div>

      <fieldset className="mt-4">
        <legend className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted"><Database className="h-3.5 w-3.5" /> Select data sources</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCE_KEYS.map((source) => (
            <label key={source} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 ${sources.includes(source) ? "border-brand-300 bg-brand-50" : "border-line bg-white"}`}>
              <input type="checkbox" checked={sources.includes(source)} onChange={() => toggleSource(source)} className="mt-0.5 accent-brand-600" />
              <span>
                <span className="block text-[10px] font-bold text-navy">{SOURCE_META[source].label}</span>
                <span className="mt-1 block text-[8px] leading-4 text-muted">{SOURCE_META[source].detail}</span>
                {hunt.sources.includes(source) ? <span className="mt-1 inline-block text-[7px] font-bold uppercase tracking-[0.08em] text-brand-700">Hypothesis core</span> : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-3 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-xl border border-line bg-mist-50 p-3">
          <label htmlFor="hunt-threshold" className="flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            <span>Tune threshold</span><output className="font-mono text-brand-700">{threshold}</output>
          </label>
          <input id="hunt-threshold" type="range" min={25} max={95} step={1} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="lab-range mt-3" />
          <div className="mt-1 flex justify-between font-mono text-[8px] text-muted"><span>25 · broad</span><span>95 · strict</span></div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[35, 60, 75, 90].map((preset) => (
              <StepButton key={preset} active={threshold === preset} done={false} onClick={() => setThreshold(preset)}>{preset}</StepButton>
            ))}
          </div>
          <p className="mt-2 text-[9px] leading-4 text-muted">A higher threshold usually reduces false positives and lowers recall. Score weights are fixed toy values, not a production model.</p>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-navy">
          <p className="border-b border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-200">Generated hunt query · pseudo-query</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-[9px] leading-5 text-mist-100"><code>{query}</code></pre>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="Matching events" value={hasRun ? `${matched.length} / ${visibleEvents.length}` : "—"} />
        <Metric label="Precision" value={hasRun ? percent(truePositives, matched.length) : "—"} tone={hasRun && precision >= 0.6 ? "teal" : hasRun ? "coral" : "brand"} />
        <Metric label="Recall" value={hasRun ? percent(truePositives, positives) : "—"} tone={hasRun && recall >= 0.6 ? "teal" : hasRun ? "gold" : "brand"} />
        <Metric label="Detection coverage" value={hasRun && mapped ? `${coverage}%` : "—"} tone={coverage >= 75 ? "teal" : coverage > 0 ? "gold" : "brand"} />
        <Metric label="False-positive reduction" value={hasRun ? `${falsePositiveReduction}%` : "—"} tone="teal" />
        <Metric label="Source coverage" value={`${sourceCoverage}%`} tone={sourceCoverage === 100 ? "teal" : "gold"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="overflow-hidden rounded-xl border border-line">
          <div className="bg-mist-50 px-3 py-2">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Crosshair className="h-3.5 w-3.5 text-brand-600" /> Matching events</p>
          </div>
          {hasRun ? (
            matched.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[9px]">
                  <caption className="sr-only">Toy events that match the selected hypothesis, sources and threshold</caption>
                  <thead className="text-muted"><tr><th className="px-3 py-2 font-bold">Time</th><th className="px-3 py-2 font-bold">Source</th><th className="px-3 py-2 font-bold">Host / user</th><th className="px-3 py-2 font-bold">Observed event</th><th className="px-3 py-2 text-right font-bold">Score</th></tr></thead>
                  <tbody>
                    {matched.map((event) => (
                      <tr key={event.id} className="border-t border-line bg-brand-50/40 align-top">
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-muted">{event.time}<span className="mt-1 block font-mono text-[8px]">{event.id}</span></td>
                        <td className="px-3 py-2"><span className="rounded-full border border-line bg-white px-2 py-0.5 text-[8px] font-bold uppercase text-muted">{event.source}</span></td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-navy">{event.host}<span className="mt-1 block text-muted">{event.user}</span></td>
                        <td className="px-3 py-2 leading-4 text-body">{event.summary}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-brand-700">{event.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="px-3 py-5 text-[10px] leading-5 text-muted">No selected event reaches threshold {threshold}. Check freshness and source coverage before interpreting zero matches as absence of threat.</p>
          ) : <p className="px-3 py-5 text-[10px] leading-5 text-muted">Run the query to reveal matching events. Ground-truth labels stay hidden from the result table; evaluation metrics use the toy fixture only.</p>}
        </section>

        <section className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Environment baseline</p>
          <dl className="mt-3 space-y-3 text-[9px] leading-4">
            <div><dt className="font-bold uppercase tracking-[0.08em] text-muted">Threshold-30 matches</dt><dd className="mt-1 font-mono text-lg font-bold text-brand-700">{hasRun ? baselineEvents.length : hunt.baselineMatches}</dd></div>
            <div><dt className="font-bold uppercase tracking-[0.08em] text-muted">Historical match rate</dt><dd className="mt-1 text-body">{hunt.baselineRate}</dd></div>
            <div><dt className="font-bold uppercase tracking-[0.08em] text-muted">Median volume</dt><dd className="mt-1 text-body">{hunt.medianVolume}</dd></div>
            <div><dt className="font-bold uppercase tracking-[0.08em] text-muted">Benign look-alikes</dt><dd className="mt-1 text-body">{hunt.refuting}</dd></div>
          </dl>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="bg-mist-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">ATT&amp;CK detection coverage</p>
        </div>
        {mapped ? (
          <ul className="divide-y divide-line">
            {hunt.techniques.map((technique) => {
              const covered = coveredTechniques.includes(technique);
              const missingSources = technique.sources.filter((source) => !sources.includes(source));
              return (
                <li key={technique.id} className={`grid gap-2 px-3 py-2 sm:grid-cols-[210px_1fr_110px] ${covered ? "bg-emerald-50/40" : "bg-white"}`}>
                  <div><p className="font-mono text-[9px] font-bold text-navy">{technique.id}</p><p className="mt-1 text-[9px] font-semibold text-body">{technique.name}</p></div>
                  <p className="text-[9px] leading-4 text-muted">{technique.evidence}</p>
                  <div className="sm:text-right">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${covered ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gold-200 bg-gold-50 text-gold-700"}`}>{covered ? "Covered" : "Gap"}</span>
                    {missingSources.length > 0 ? <p className="mt-1 text-[8px] text-muted">Missing: {missingSources.join(", ")}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <p className="px-3 py-4 text-[10px] leading-5 text-muted">Run the query and select “Map ATT&amp;CK” to link observed behaviours to techniques. A technique name without evidence is a coverage claim, not a detection.</p>}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-3">
          <label htmlFor="hunt-response" className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Choose response</label>
          <select id="hunt-response" value={response} onChange={(event) => chooseResponse(event.target.value as ResponseKey)} className="mt-2 w-full rounded-lg border border-line bg-mist-50 px-3 py-2 text-[10px] font-semibold text-body">
            {(Object.keys(RESPONSES) as ResponseKey[]).map((key) => <option key={key} value={key}>{RESPONSES[key].label}</option>)}
          </select>
          <div className={`mt-3 rounded-xl border p-3 ${hasRun && truePositives > 0 && precision >= 0.6 && recall >= 0.6 ? "border-emerald-200 bg-emerald-50" : "border-gold-200 bg-gold-50"}`} aria-live="polite">
            <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-navy"><ShieldAlert className="h-3.5 w-3.5" /> {decisionTitle}</p>
            <p className="mt-2 text-[10px] leading-5 text-body">{decisionText}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-navy">
          <p className="inline-flex items-center gap-1.5 border-b border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-200"><TerminalSquare className="h-3.5 w-3.5" /> Safe read-only command reference</p>
          <div className="max-h-[330px] overflow-auto px-3 py-2">
            {COMMANDS.map((entry) => (
              <div key={entry.title} className="border-b border-white/10 py-2 last:border-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-mist-100">{entry.title} · {entry.source}</p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[8px] leading-4 text-brand-100"><code>{entry.command}</code></pre>
                <p className="mt-1 text-[8px] leading-4 text-mist-100/80">{entry.scope}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-3 rounded-xl border border-line bg-mist-50 p-3 text-[9px] leading-5 text-muted" aria-live="polite">
        <strong className="text-navy">Analyst guidance:</strong> {guidance} Evaluation: {hasRun ? `${truePositives} TP, ${falsePositives} FP and ${falseNegatives} FN; ${coveredTechniques.length} of ${hunt.techniques.length} ATT&CK techniques covered.` : "Metrics populate after execution."}
        {hasRun && mapped ? <CheckCircle2 className="ml-1 inline h-3 w-3 text-emerald-600" /> : null}
      </div>
    </VisualizerShell>
  );
}
