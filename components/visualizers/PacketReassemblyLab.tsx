"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Shuffle, TimerOff } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const FRAGMENTS = [
  { id: 0, label: "F1", start: 1000, end: 1199, bytes: 200, text: "GET /admin?deb" },
  { id: 1, label: "F2", start: 1200, end: 1399, bytes: 200, text: "ug=1 HTTP/1.1\r\nHo" },
  { id: 2, label: "F3", start: 1400, end: 1599, bytes: 200, text: "st: workstation\r\nCo" },
  { id: 3, label: "F4", start: 1600, end: 1799, bytes: 200, text: "okie: session= toy\r\n" },
];
const ORDERS = [[0, 2, 1, 3], [2, 0, 3, 1], [3, 1, 0, 2], [1, 3, 2, 0]];
const ARRIVAL_TIMES = [0, 2, 6, 9];

export function PacketReassemblyLab() {
  const [orderIndex, setOrderIndex] = useState(0);
  const [arrivalCount, setArrivalCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [dropped, setDropped] = useState<number | null>(null);
  const [timeout, setTimeoutValue] = useState(8);
  const [encrypted, setEncrypted] = useState(false);

  const order = ORDERS[orderIndex];
  const deliverable = order.filter((id) => id !== dropped);
  const arrivedIds = deliverable.slice(0, arrivalCount);
  const complete = arrivedIds.length === FRAGMENTS.length;
  const expired = !complete && elapsed > timeout;
  const inspectable = complete && !expired;
  const contiguous = FRAGMENTS.reduce((total, fragment) => arrivedIds.includes(fragment.id) ? total + fragment.bytes : total, 0);
  const contiguousFromStart = (() => {
    let expected = FRAGMENTS[0].start;
    let bytes = 0;
    for (const fragment of FRAGMENTS) {
      if (!arrivedIds.includes(fragment.id) || fragment.start !== expected) break;
      bytes += fragment.bytes;
      expected = fragment.end + 1;
    }
    return bytes;
  })();
  const plaintext = FRAGMENTS.map((fragment) => fragment.text).join("");

  function clearRun() {
    setArrivalCount(0);
    setElapsed(0);
  }

  function next() {
    if (expired) return;
    if (arrivalCount < deliverable.length) {
      const nextCount = arrivalCount + 1;
      setArrivalCount(nextCount);
      setElapsed(ARRIVAL_TIMES[nextCount - 1]);
    } else {
      setElapsed(timeout + 1);
    }
  }

  function jumpToArrival(count: number) {
    setArrivalCount(count);
    setElapsed(count > 0 ? ARRIVAL_TIMES[count - 1] : 0);
  }

  function reset() {
    setOrderIndex(0);
    setArrivalCount(0);
    setElapsed(0);
    setDropped(null);
    setTimeoutValue(8);
    setEncrypted(false);
  }

  return (
    <VisualizerShell
      title="Fragmentation and reassembly timeout"
      description="Deliver four TCP segments out of order, lose one, and race the reassembly timer."
      onReset={reset}
      controls={
        <>
          <label className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-body">
            <span className="sr-only">Drop a fragment</span>
            <select
              value={dropped ?? ""}
              onChange={(event) => {
                setDropped(event.target.value === "" ? null : Number(event.target.value));
                clearRun();
              }}
              className="bg-transparent text-body focus:outline-none"
              aria-label="Drop a fragment"
            >
              <option value="">Drop: none</option>
              {FRAGMENTS.map((fragment) => <option key={fragment.id} value={fragment.id}>Drop {fragment.label}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setOrderIndex((value) => (value + 1) % ORDERS.length);
              clearRun();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-muted hover:border-brand-200 hover:text-brand-700"
          >
            <Shuffle className="h-3 w-3" /> Scramble
          </button>
          <button
            type="button"
            onClick={next}
            disabled={expired}
            className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {arrivalCount < deliverable.length ? "Next packet" : "Advance clock"} <ArrowRight className="h-3 w-3" />
          </button>
        </>
      }
      footer={
        <span>
          Reassembly binds fragments by flow and TCP sequence range; arrival order alone is not enough. A passive sensor can only alert on an inspected payload, while an inline IPS can reset or drop the flow and turns false positives into availability risk. TLS 1.3 ciphertext can be reassembled but not interpreted as plaintext without an authorised endpoint or decryption point. Bound reassembly memory and time in production.
        </span>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="flex justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            <span>Reassembly timeout</span><output className="font-mono text-brand-700">{timeout}s</output>
          </span>
          <input
            type="range"
            min={2}
            max={12}
            step={1}
            value={timeout}
            onChange={(event) => {
              setTimeoutValue(Number(event.target.value));
              clearRun();
            }}
            className="lab-range mt-2"
            aria-label="Reassembly timeout in seconds"
          />
        </label>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 text-[10px] font-bold text-body">
          <input
            type="checkbox"
            checked={encrypted}
            onChange={(event) => setEncrypted(event.target.checked)}
            className="accent-brand-600"
          />
          {encrypted ? <EyeOff className="h-3.5 w-3.5 text-brand-600" /> : <Eye className="h-3.5 w-3.5 text-brand-600" />}
          Encrypted payload
        </label>
        <div className={`rounded-lg border px-3 py-2 text-[10px] font-bold ${expired ? "border-rose-200 bg-rose-50 text-rose-700" : complete ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-brand-200 bg-brand-50 text-brand-700"}`} aria-live="polite">
          {expired ? `Timed out at ${timeout + 1}s` : complete ? "Stream complete" : `Clock ${elapsed}s / deadline ${timeout}s`}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Packet arrivals">
        {deliverable.map((id, index) => (
          <StepButton
            key={id}
            active={arrivalCount === index + 1 && !expired}
            done={arrivalCount > index + 1 || (expired && index < arrivalCount)}
            onClick={() => jumpToArrival(index + 1)}
          >
            {FRAGMENTS[id].label}
          </StepButton>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="Fragments received" value={`${arrivedIds.length} / 4`} tone={complete ? "teal" : "brand"} />
        <Metric label="Contiguous from 1000" value={`${contiguousFromStart} B`} tone={contiguousFromStart === 800 ? "teal" : "gold"} />
        <Metric label="Payload inspection" value={inspectable ? (encrypted ? "Headers only" : "Available") : expired ? "Timed out" : "Incomplete"} tone={inspectable && !encrypted ? "teal" : expired ? "rose" : "gold"} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Arrival order</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <caption className="sr-only">TCP fragment arrival order, sequence ranges and arrival times</caption>
              <thead className="text-muted">
                <tr><th className="py-1 pr-2">#</th><th className="py-1 pr-2">Fragment</th><th className="py-1 pr-2">TCP range</th><th className="py-1">Arrival</th></tr>
              </thead>
              <tbody className="font-mono text-navy">
                {order.map((id, index) => {
                  const fragment = FRAGMENTS[id];
                  const isDropped = dropped === id;
                  const deliveryIndex = deliverable.indexOf(id);
                  const arrived = deliveryIndex >= 0 && deliveryIndex < arrivalCount;
                  return (
                    <tr key={id} className={`border-t border-line ${isDropped ? "text-rose-600" : arrived ? "bg-emerald-50/60" : "text-muted"}`}>
                      <td className="py-1.5 pr-2">{index + 1}</td>
                      <td className="py-1.5 pr-2 font-bold">{fragment.label}</td>
                      <td className="py-1.5 pr-2">{fragment.start}–{fragment.end}</td>
                      <td className="py-1.5">{isDropped ? "dropped" : arrived ? `${ARRIVAL_TIMES[deliveryIndex]}s` : expired ? "never" : "waiting"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-white p-2.5 text-[10px] leading-4 text-muted">
            <TimerOff className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            <span>
              {expired
                ? `The first fragment arrived at 0s and the timer expired after ${timeout}s. A late segment cannot revive this reassembly entry; the sensor must free its bounded state.`
                : complete
                  ? "All four ranges arrived before the deadline. Retransmissions and overlaps are deduplicated before inspection."
                  : contiguousFromStart === 0
                    ? "The first sequence range is still missing, so no payload bytes can be released to the inspector."
                    : `${contiguousFromStart} bytes are contiguous from sequence 1000. The inspector waits for the missing range rather than concatenating arrival order.`}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Reassembly buffer · sequence 1000–1799</p>
            <span className="font-mono text-[9px] text-muted">{contiguous} B received</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {FRAGMENTS.map((fragment) => {
              const isDropped = dropped === fragment.id;
              const arrived = arrivedIds.includes(fragment.id);
              return (
                <div key={fragment.id} className={`rounded-lg border p-2 ${isDropped ? "border-rose-200 bg-rose-50" : arrived ? "border-emerald-200 bg-emerald-50" : "border-line bg-mist-50"}`}>
                  <p className={`font-mono text-[10px] font-bold ${isDropped ? "text-rose-700" : arrived ? "text-emerald-700" : "text-muted"}`}>{fragment.label}</p>
                  <p className="mt-1 font-mono text-[8px] text-muted">{fragment.start}–{fragment.end}</p>
                  <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.06em] text-muted">{isDropped ? "dropped" : arrived ? "buffered" : "gap"}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Inspector input</p>
          <div className={`mt-1 min-h-20 break-words rounded-lg border p-3 font-mono text-[10px] leading-5 ${inspectable ? "border-brand-200 bg-brand-50 text-brand-900" : "border-line bg-mist-50 text-muted"}`}>
            {!inspectable
              ? expired ? "[reassembly entry discarded: timeout]" : "[withheld: incomplete byte stream]"
              : encrypted
                ? "17 03 03 01 cc  8f 4a  …  [TLS application data ciphertext]"
                : plaintext}
          </div>
          <p className={`mt-2 text-[10px] leading-4 ${inspectable && !encrypted ? "text-emerald-700" : "text-muted"}`} aria-live="polite">
            {!inspectable
              ? "Payload signatures cannot run on an incomplete stream."
              : encrypted
                ? "Sequence ranges and TLS record headers are visible, but the HTTP request is not. Use endpoint telemetry or an authorised decryption point."
                : "The reconstructed plaintext reveals GET /admin?debug=1, so a content signature can match across fragment boundaries."}
          </p>
        </div>
      </div>
    </VisualizerShell>
  );
}
