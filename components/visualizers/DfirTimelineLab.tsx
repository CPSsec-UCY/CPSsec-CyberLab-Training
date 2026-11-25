"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Database, FileSearch, Fingerprint, GitCompareArrows, LockKeyhole, ShieldAlert } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type SourceKey = "memory" | "disk" | "logs" | "files";

interface EvidenceSource {
  key: SourceKey;
  label: string;
  detail: string;
  hash: string;
  bytes: string;
  collectedAt: string;
  collector: string;
}

interface TimelineEvent {
  id: string;
  source: SourceKey;
  rawTime: string;
  offset: number;
  title: string;
  detail: string;
  suspicious: boolean;
}

const SOURCES: EvidenceSource[] = [
  {
    key: "memory",
    label: "Physical memory image",
    detail: "WORKSTATION-17 · live acquisition · Windows 11 x64",
    hash: "7d3c81e9a5f04b62c18d7e06a4915b3fd80c672ea4195db6f0c214a8e73d95b",
    bytes: "8.0 GiB",
    collectedAt: "2026-11-18 09:09:40 UTC",
    collector: "analyst-a / approved memory tool 4.2",
  },
  {
    key: "disk",
    label: "Forensic disk image",
    detail: "WORKSTATION-17 · write-blocked acquisition · NTFS volume",
    hash: "c41a90982b67d5ef3071a84ce0f29d6b57a8130e649f2c5d78b496ae1073f60",
    bytes: "512 GiB",
    collectedAt: "2026-11-18 09:14:02 UTC",
    collector: "analyst-a / approved imager 6.1",
  },
  {
    key: "logs",
    label: "Parsed Windows event logs",
    detail: "Derived from disk image · Security and Sysmon channels",
    hash: "e219a4c7780b3f6d09582ab17ec40df6352b97186d4c0af9e8123c6a507b8f41",
    bytes: "184,320 events",
    collectedAt: "2026-11-18 09:22:11 UTC",
    collector: "analyst-b / parser 2.8 / working copy",
  },
  {
    key: "files",
    label: "Extracted file metadata",
    detail: "Derived from disk image · $MFT, USN journal and directory index",
    hash: "9b20f6471a83ce5d017d8b42eaf96c3007d1e64b852af3c6e079014d28f5ca3",
    bytes: "2,461 records",
    collectedAt: "2026-11-18 09:26:48 UTC",
    collector: "analyst-b / metadata parser 3.0 / working copy",
  },
];

const TIMELINE: TimelineEvent[] = [
  {
    id: "EV-01",
    source: "logs",
    rawTime: "2026-11-18T09:00:00Z",
    offset: 0,
    title: "Interactive sign-in accepted",
    detail: "Security 4624 · finance17 · WORKSTATION-17 · logon type 10 · source VPN-GW-02",
    suspicious: false,
  },
  {
    id: "EV-02",
    source: "files",
    rawTime: "2026-11-18T09:03:10Z",
    offset: 0,
    title: "Invoice executable created",
    detail: "C:\\Users\\finance17\\Downloads\\Q4_invoice.exe · MFT 48219 · 48,640 bytes",
    suspicious: true,
  },
  {
    id: "EV-03",
    source: "logs",
    rawTime: "2026-11-18T09:03:14Z",
    offset: 90,
    title: "Encoded PowerShell child created",
    detail: "Sysmon 1 · PID 5104 · parent Q4_invoice.exe PID 4812 · hidden window · -enc command",
    suspicious: true,
  },
  {
    id: "EV-04",
    source: "memory",
    rawTime: "2026-11-18T09:03:18Z",
    offset: 135,
    title: "Outbound socket linked to child process",
    detail: "PID 5104 · TCP 443 · 198.51.100.24 · destination uses the documentation-only range",
    suspicious: true,
  },
  {
    id: "EV-05",
    source: "memory",
    rawTime: "2026-11-18T09:05:30Z",
    offset: 135,
    title: "User Run-key value recovered",
    detail: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run → Q4_invoice.exe",
    suspicious: true,
  },
  {
    id: "EV-06",
    source: "files",
    rawTime: "2026-11-18T09:06:05Z",
    offset: 0,
    title: "Invoice executable deleted",
    detail: "MFT 48219 · directory entry removed · MFT-change time preserved · data not overwritten",
    suspicious: true,
  },
  {
    id: "EV-07",
    source: "files",
    rawTime: "2026-11-18T09:12:00Z",
    offset: 0,
    title: "Archive staged in temporary directory",
    detail: "C:\\Users\\finance17\\AppData\\Local\\Temp\\finance-export.zip · 4.8 MiB · created after sign-in",
    suspicious: true,
  },
  {
    id: "EV-08",
    source: "logs",
    rawTime: "2026-11-18T09:12:04Z",
    offset: 90,
    title: "Archive opened by a spreadsheet",
    detail: "Sysmon 11 · EXCEL.EXE opened finance-export.zip · process began at 09:12:01",
    suspicious: true,
  },
];

const MEMORY_ARTEFACTS = [
  { process: "Q4_invoice.exe · PID 4812", artefact: "Private executable region", detail: "96 KiB · protection changed to read/execute after launch", meaning: "Supports in-memory code beyond the initial disk mapping." },
  { process: "powershell.exe · PID 5104", artefact: "Command-line environment", detail: "-nop -w hidden -enc SQBFAFgA...", meaning: "Corroborates the Sysmon process-creation record." },
  { process: "powershell.exe · PID 5104", artefact: "Network socket", detail: "198.51.100.24:443 · ESTABLISHED", meaning: "Attributes the outbound session to the suspicious child." },
  { process: "Q4_invoice.exe · PID 4812", artefact: "Registry cache entry", detail: "HKCU\\...\\Run → Q4_invoice.exe", meaning: "Supports persistence even though the executable was deleted." },
];

function sourceStatus(key: SourceKey, acquired: SourceKey[], parsed: boolean, extracted: boolean) {
  if (key === "logs") return parsed ? "Parsed" : acquired.includes("disk") ? "Available" : "Locked";
  if (key === "files") return extracted ? "Extracted" : acquired.includes("disk") ? "Available" : "Locked";
  return acquired.includes(key) ? "Acquired" : "Locked";
}

function normalizedTime(event: TimelineEvent, correctSkew: boolean) {
  const raw = new Date(event.rawTime).getTime();
  return new Date(raw - (correctSkew ? event.offset * 1000 : 0));
}

function formatTime(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}`;
}

export function DfirTimelineLab() {
  const [acquired, setAcquired] = useState<SourceKey[]>([]);
  const [parsed, setParsed] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [correlated, setCorrelated] = useState(false);
  const [correctSkew, setCorrectSkew] = useState(true);
  const [hypothesis, setHypothesis] = useState("A user executed an invoice payload that spawned encoded PowerShell, established persistence and staged an archive before deleting the executable.");
  const [guidance, setGuidance] = useState("Acquire volatile memory before reconstructing the case. Then acquire the disk and derive logs and file metadata from verified working copies.");

  const hasMemory = acquired.includes("memory");
  const hasDisk = acquired.includes("disk");
  const available = TIMELINE.filter((event) => {
    if (event.source === "memory") return hasMemory;
    if (event.source === "logs") return parsed;
    return extracted;
  });
  const ordered = [...available].sort((left, right) => {
    const leftTime = normalizedTime(left, correctSkew).getTime();
    const rightTime = normalizedTime(right, correctSkew).getTime();
    if (!correlated && left.source !== right.source) return left.source.localeCompare(right.source);
    return leftTime - rightTime;
  });
  const suspiciousCount = ordered.filter((event) => event.suspicious).length;
  const evidenceCount = [hasMemory, hasDisk, parsed, extracted].filter(Boolean).length;
  const confidence = Math.min(97, 5 + (hasMemory ? 26 : 0) + (hasDisk ? 14 : 0) + (parsed ? 18 : 0) + (extracted ? 16 : 0) + (correlated ? 18 : 0));
  const confidenceLabel = confidence >= 70 ? "High" : confidence >= 40 ? "Moderate" : "Low";
  const verifiedSources = SOURCES.filter((source) => {
    if (source.key === "logs") return parsed;
    if (source.key === "files") return extracted;
    return acquired.includes(source.key);
  });
  const sequenceReady = parsed && extracted && hasMemory && correlated;

  function acquireMemory() {
    setAcquired((current) => current.includes("memory") ? current : [...current, "memory"]);
    setGuidance("Memory acquired and hashed. Record the acquisition time and collector before analysis; volatile state is not the same as a complete account of past execution.");
  }

  function acquireDisk() {
    setAcquired((current) => current.includes("disk") ? current : [...current, "disk"]);
    setGuidance("Disk image acquired and hashed. Parse event logs and extract file metadata only from verified working copies; never treat the original image as a scratch volume.");
  }

  function parseLogs() {
    if (!hasDisk) {
      setGuidance("Event-log parsing needs the acquired disk image. Collect the disk first, verify its hash, then parse a working copy.");
      return;
    }
    setParsed(true);
    setGuidance("Security and Sysmon events parsed. Endpoint timestamps carry a +90 second clock offset in this toy case; compare raw and normalised values before ordering events.");
  }

  function extractFiles() {
    if (!hasDisk) {
      setGuidance("File metadata extraction needs the acquired disk image. File timestamps describe filesystem state, not necessarily the order in which a user acted.");
      return;
    }
    setExtracted(true);
    setGuidance("MFT and directory metadata extracted. Deleted-file records can preserve names, sizes and several timestamps even after the directory entry disappears.");
  }

  function correlateTimeline() {
    if (!parsed || !extracted) {
      setGuidance("Correlation needs both parsed event logs and extracted file metadata. Collect those inputs, then merge them by normalised time, host, user and process.");
      return;
    }
    setCorrelated((current) => !current);
    setGuidance(correlated
      ? "Correlation switched off. Source-grouped records are useful for provenance checks; the merged view is useful for testing a causal hypothesis."
      : "Sources merged into a super timeline. Memory clocks carry a +135 second offset in the toy case; corrected ordering supports the hypothesis without proving who initiated the activity.");
  }

  function reset() {
    setAcquired([]);
    setParsed(false);
    setExtracted(false);
    setCorrelated(false);
    setCorrectSkew(true);
    setHypothesis("A user executed an invoice payload that spawned encoded PowerShell, established persistence and staged an archive before deleting the executable.");
    setGuidance("Acquire volatile memory before reconstructing the case. Then acquire the disk and derive logs and file metadata from verified working copies.");
  }

  const facts = [
    hasDisk ? "A write-blocked disk image was acquired and hashed." : "Disk evidence has not yet been collected.",
    parsed ? "Security and Sysmon records show sign-in, process creation and archive access." : "Windows event logs have not yet been parsed.",
    extracted ? "File records show executable creation, deletion and archive staging." : "File metadata has not yet been extracted.",
    hasMemory ? "Memory contains the suspicious process, socket and Run-key artefacts." : "Volatile memory has not yet been acquired.",
  ];

  const report = [
    "DFIR CASE TOY-2026-0418 · WORKSTATION-17 · user finance17",
    "Scope: 2026-11-18 08:50–09:20 UTC · simulated teaching data only",
    "",
    "Analyst hypothesis:",
    hypothesis.trim() || "No hypothesis recorded.",
    "",
    "Observed facts:",
    ...facts.map((fact) => `- ${fact}`),
    "",
    `Confidence: ${confidenceLabel} (${confidence}/100 illustrative evidence score)`,
    correlated ? "Timeline: sources correlated with documented clock correction." : "Timeline: source records are not yet correlated.",
    "",
    "Limitations:",
    "- A hash proves stability after acquisition, not acquisition completeness or lawful collection.",
    "- The toy case does not establish user intent, attacker identity or enterprise-wide scope.",
    "- Memory and disk evidence share the same compromised host and are not fully independent.",
    "",
    "Recommended next action:",
    sequenceReady
      ? "Preserve the staged archive and identity logs, isolate the host, revoke finance17 sessions and hunt for the same process chain on peer systems."
      : "Continue evidence collection; preserve identity and network logs and avoid destructive eradication until scope is understood.",
  ].join("\n");

  return (
    <VisualizerShell
      title="DFIR timeline and evidence workbench"
      description="Build a defensible super timeline for a deterministic simulated workstation incident."
      onReset={reset}
      controls={
        <>
          <StepButton active={hasMemory} done={hasMemory} onClick={acquireMemory}>Acquire memory</StepButton>
          <StepButton active={hasDisk} done={hasDisk} onClick={acquireDisk}>Acquire disk</StepButton>
          <StepButton active={parsed} done={parsed} onClick={parseLogs}>Parse event logs</StepButton>
          <StepButton active={extracted} done={extracted} onClick={extractFiles}>Extract file metadata</StepButton>
          <StepButton active={correlated} done={correlated} onClick={correlateTimeline}>Correlate timeline</StepButton>
          <StepButton active={correctSkew} done={false} onClick={() => setCorrectSkew((current) => !current)}>Toggle clock skew</StepButton>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">SIMULATED — no live acquisition:</strong> hosts, users, hashes, artefacts and addresses are fictional. Addresses use 198.51.100.0/24. Clock offsets, evidence weights and confidence are fixed teaching values, not a calibrated probability. The exercise never reads or changes a real system.
        </span>
      }
    >
      <div className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-coral-700">
        Toy case TOY-2026-0418 · WORKSTATION-17 · finance17 · safe evidence objects only
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="Evidence inputs" value={`${evidenceCount} / 4`} />
        <Metric label="Timeline records" value={ordered.length} tone="brand" />
        <Metric label="Suspicious records" value={suspiciousCount} tone={suspiciousCount > 0 ? "coral" : "teal"} />
        <Metric label="Analyst confidence" value={`${confidenceLabel} · ${confidence}`} tone={confidence >= 70 ? "rose" : confidence >= 40 ? "gold" : "teal"} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-xl border border-line">
          <div className="flex items-center gap-2 bg-mist-50 px-3 py-2">
            <Database className="h-3.5 w-3.5 text-brand-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Evidence sources and availability</p>
          </div>
          <div className="overflow-x-auto" role="region" aria-label="Scrollable data table" tabIndex={0}>
            <table className="cyber-table cyber-table--dense w-full min-w-[690px] text-left text-[11px]">
              <caption className="sr-only">Four toy evidence sources, their availability and their acquisition method</caption>
              <thead className="text-muted">
                <tr><th scope="col" className="px-3 py-2 font-bold">Source</th><th scope="col" className="px-3 py-2 font-bold">Status</th><th scope="col" className="px-3 py-2 font-bold">Method</th><th scope="col" className="px-3 py-2 font-bold">Size</th></tr>
              </thead>
              <tbody>
                {SOURCES.map((source) => {
                  const status = sourceStatus(source.key, acquired, parsed, extracted);
                  return (
                    <tr key={source.key} className="border-t border-line align-top">
                      <td className="px-3 py-2"><span className="block font-bold text-navy">{source.label}</span><span className="mt-1 block text-muted">{source.detail}</span></td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${status === "Locked" || status === "Available" ? "border-line bg-mist-50 text-muted" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                          {status === "Locked" ? <LockKeyhole className="h-2.5 w-2.5" /> : status !== "Available" ? <CheckCircle2 className="h-2.5 w-2.5" /> : null}
                          {status}
                        </span>
                      </td>
                      <td className="max-w-[250px] px-3 py-2 leading-4 text-body">{source.collector}</td>
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-body">{source.bytes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-brand-200 bg-brand-50 p-3" aria-live="polite">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-brand-700"><Clock3 className="h-3.5 w-3.5" /> Analyst guidance</p>
          <p className="mt-2 text-[10px] leading-5 text-body">{guidance}</p>
          <div className="mt-3 rounded-lg border border-brand-100 bg-white p-2 text-[9px] leading-4 text-muted">
            <strong className="text-navy">Clock handling:</strong> {correctSkew ? "Corrections are applied to endpoint events (+90s Sysmon, +135s memory)." : "Raw source times are displayed; memory events now appear after archive access even though their raw clocks are offset."}
          </div>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-mist-50 px-3 py-2">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><GitCompareArrows className="h-3.5 w-3.5 text-brand-600" /> {correlated ? "Correlated super timeline" : "Source-grouped evidence timeline"}</p>
          <span className="font-mono text-[9px] text-brand-700">{correctSkew ? "UTC normalised" : "raw source time"}</span>
        </div>
        {ordered.length > 0 ? (
          <ol className="divide-y divide-line">
            {ordered.map((event) => {
              const normal = normalizedTime(event, correctSkew);
              const raw = new Date(event.rawTime);
              return (
                <li key={event.id} className={`grid gap-2 px-3 py-3 sm:grid-cols-[92px_86px_1fr] ${event.suspicious ? "bg-coral-50/50" : "bg-white"}`}>
                  <div>
                    <p className="font-mono text-[10px] font-bold text-navy">{formatTime(normal)}</p>
                    <p className="mt-1 font-mono text-[8px] text-muted">raw {formatTime(raw)}</p>
                  </div>
                  <div>
                    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[8px] font-bold uppercase text-muted">{event.source}</span>
                    <p className="mt-1 font-mono text-[8px] text-muted">{event.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-navy">{event.title}</p>
                    <p className="mt-1 break-words font-mono text-[9px] leading-4 text-body">{event.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="px-3 py-5 text-[10px] leading-5 text-muted">No timeline records are available yet. Acquire and process evidence using the controls above.</p>
        )}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Fingerprint className="h-3.5 w-3.5 text-brand-600" /> Chain-of-custody hashes</p>
          {verifiedSources.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {verifiedSources.map((source) => (
                <li key={source.key} className="rounded-lg border border-line bg-mist-50 p-2">
                  <div className="flex flex-wrap justify-between gap-1"><span className="text-[9px] font-bold text-navy">{source.label}</span><span className="font-mono text-[8px] text-muted">{source.collectedAt}</span></div>
                  <p className="mt-1 break-all font-mono text-[8px] leading-4 text-brand-700">SHA-256 {source.hash}</p>
                  <p className="mt-1 text-[8px] leading-4 text-muted">{source.collector} · digest verified on ingest · access logged</p>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-[10px] leading-5 text-muted">No custody record exists until an artefact is collected or derived. Hash the acquired original and store the digest separately from the evidence.</p>}
        </section>

        <section className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><FileSearch className="h-3.5 w-3.5 text-brand-600" /> Deleted-file metadata</p>
          {extracted ? (
            <dl className="mt-2 grid grid-cols-[112px_1fr] gap-x-3 gap-y-2 text-[9px] leading-4">
              <dt className="font-bold text-muted">Original name</dt><dd className="break-all font-mono text-navy">Q4_invoice.exe</dd>
              <dt className="font-bold text-muted">MFT record</dt><dd className="font-mono text-body">48219 · sequence 3</dd>
              <dt className="font-bold text-muted">Size</dt><dd className="font-mono text-body">48,640 bytes · 12 clusters</dd>
              <dt className="font-bold text-muted">Created</dt><dd className="font-mono text-body">2026-11-18 09:03:10 UTC</dd>
              <dt className="font-bold text-muted">Modified</dt><dd className="font-mono text-body">2026-11-18 09:03:12 UTC</dd>
              <dt className="font-bold text-muted">MFT changed</dt><dd className="font-mono text-body">2026-11-18 09:06:05 UTC</dd>
              <dt className="font-bold text-muted">Deleted flag</dt><dd className="text-coral-700">Set · directory entry absent</dd>
              <dt className="font-bold text-muted">Recoverability</dt><dd className="text-body">Toy record: clusters not overwritten</dd>
            </dl>
          ) : <p className="mt-2 text-[10px] leading-5 text-muted">Acquire the disk and extract metadata to inspect the deleted executable record. Timestamps are filesystem observations, not proof of user intent.</p>}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-line bg-white p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Memory artefacts</p>
        {hasMemory ? (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {MEMORY_ARTEFACTS.map((artefact) => (
              <div key={`${artefact.process}-${artefact.artefact}`} className="rounded-lg border border-line bg-mist-50 p-2">
                <p className="text-[9px] font-bold text-navy">{artefact.artefact}</p>
                <p className="mt-1 font-mono text-[8px] text-brand-700">{artefact.process}</p>
                <p className="mt-1 break-all font-mono text-[9px] leading-4 text-body">{artefact.detail}</p>
                <p className="mt-1 text-[9px] leading-4 text-muted">{artefact.meaning}</p>
              </div>
            ))}
          </div>
        ) : <p className="mt-2 text-[10px] leading-5 text-muted">Acquire memory to reveal process state, sockets and persistence artefacts that may not survive on disk.</p>}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-3">
          <label htmlFor="dfir-hypothesis" className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy">Analyst hypothesis</label>
          <textarea
            id="dfir-hypothesis"
            value={hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-line bg-mist-50 p-2 text-[10px] leading-5 text-body"
          />
          <p className="mt-2 text-[9px] leading-4 text-muted">Write a falsifiable claim. Record contrary evidence and unknowns in the report rather than treating the timeline as a story that must be true.</p>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-navy">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <ShieldAlert className="h-3.5 w-3.5 text-brand-200" />
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-mist-100">Generated incident report</p>
          </div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words px-3 py-3 font-mono text-[8px] leading-4 text-mist-100"><code>{report}</code></pre>
        </section>
      </div>
    </VisualizerShell>
  );
}
