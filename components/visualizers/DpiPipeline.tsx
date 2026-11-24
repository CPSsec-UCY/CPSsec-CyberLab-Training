"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldAlert, ShieldCheck, Wifi } from "lucide-react";

const STAGES = [
  { name: "Capture", detail: "Copy frames or receive a packet stream from a tap, SPAN port or capture library." },
  { name: "Decode", detail: "Parse link, IP and transport headers. Validate lengths and checksums." },
  { name: "Flow", detail: "Associate packets into flows, reassemble streams and track TCP state." },
  { name: "Detect", detail: "Apply signatures, protocol parsers, anomaly models and threat intelligence." },
  { name: "Action", detail: "Alert, log, throttle, reset or block — depending on inline or passive placement." },
];

export function DpiPipeline() {
  const [encrypted, setEncrypted] = useState(true);
  const [inline, setInline] = useState(false);
  const [payload, setPayload] = useState("GET /admin?debug=1 HTTP/1.1");
  const [stage, setStage] = useState(0);

  const suspicious = /admin|debug|cmd=|union|select/i.test(payload);
  const canInspectPayload = !encrypted;
  const alert = suspicious && canInspectPayload;

  function next() {
    setStage((value) => (value + 1) % STAGES.length);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setEncrypted((value) => !value)} aria-pressed={encrypted} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${encrypted ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body"}`}>
            {encrypted ? <EyeOff className="mr-1 inline h-3 w-3" /> : <Eye className="mr-1 inline h-3 w-3" />}
            {encrypted ? "TLS 1.3 encrypted" : "Plaintext"}
          </button>
          <button type="button" onClick={() => setInline((value) => !value)} aria-pressed={inline} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${inline ? "border-coral-300 bg-coral-50 text-coral-700" : "border-line bg-white text-body"}`}>
            {inline ? "Inline blocking" : "Passive monitor"}
          </button>
        </div>
        <button type="button" onClick={next} className="btn-primary px-3 py-1.5 text-[10px]">
          Next stage <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-mist-50 p-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700"><Wifi className="h-3.5 w-3.5" /> packet</span>
          <span className="font-mono text-[9px] text-muted">10.0.4.12:52344 → 10.0.8.20:443</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {[
            ["src", "10.0.4.12"],
            ["dst", "10.0.8.20"],
            ["proto", "TCP"],
            ["dport", "443"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-line bg-white px-2 py-1.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
              <p className="font-mono text-[10px] text-navy">{value}</p>
            </div>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">application payload (visible only without encryption)</span>
          <input value={payload} onChange={(event) => setPayload(event.target.value)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-[10px] text-navy focus:border-brand-300" />
        </label>
        <div className={`mt-2 rounded-lg border p-2 font-mono text-[10px] ${encrypted ? "border-brand-200 bg-brand-50 text-brand-800" : "border-line bg-white text-body"}`}>
          {encrypted ? "17 03 03 02 00  [encrypted application data]  ·  SNI may remain visible without ECH" : payload}
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-5">
        {STAGES.map((item, index) => {
          const active = index === stage;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setStage(index)}
              className={`rounded-xl border p-3 text-left transition ${
                active ? "border-brand-300 bg-brand-50 shadow-sm" : "border-line bg-white hover:border-brand-200"
              }`}
            >
              <span className={`text-[9px] font-bold uppercase tracking-[0.12em] ${active ? "text-brand-700" : "text-muted"}`}>0{index + 1}</span>
              <p className="mt-1 text-xs font-bold text-navy">{item.name}</p>
              <p className="mt-1 text-[10px] leading-4 text-muted">{item.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-white p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">stage output</p>
        <div className="mt-2 flex items-start gap-2 text-xs leading-5">
          {stage === 3 ? (
            alert ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />}
          <div className="text-body">
            {stage === 0 && "Frame copied. Metadata such as packet size and timing is always visible, even for encrypted traffic."}
            {stage === 1 && "IP addresses, ports, TCP flags and protocol numbers parsed. The payload is still opaque if TLS is active."}
            {stage === 2 && "Flow reconstructed. Application-layer reconstruction requires plaintext or endpoint telemetry."}
            {stage === 3 && (alert
              ? "Signature match on the plaintext payload. The alert includes the flow and the matched pattern."
              : encrypted
                ? "Payload signatures cannot inspect TLS ciphertext. Detection must use metadata, flow features, endpoint telemetry or decryption proxies."
                : "No signature matched the visible payload. Absence of a match is not proof of benign traffic.")}
            {stage === 4 && (alert
              ? inline ? "Inline sensor drops or resets the connection and logs the action." : "Passive sensor raises an alert for the SOC; it cannot stop the packet."
              : "No blocking action. The policy still logs flow metadata for hunting and baselining.")}
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-muted">
        DPI is a visibility tool, not a magic security boundary. TLS 1.3 sharply limits payload inspection;
        inline blocking changes the failure mode and must be tested for false positives.
      </p>
    </div>
  );
}
