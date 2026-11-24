"use client";

import { Cite } from "@/components/citations/Cite";
import { SequenceControls } from "@/components/visualizers/SequenceControls";
import { useSequencePlayer } from "@/components/visualizers/useSequencePlayer";

const EVENTS = [
  { year: "1994", title: "Shor", detail: "Factoring and discrete log fall to a quantum algorithm." },
  { year: "1996", title: "Grover", detail: "Quadratic speed-up for search; symmetric margins shrink." },
  { year: "2016", title: "NIST report", detail: "Public case for post-quantum migration." },
  { year: "2022", title: "SIKE broken", detail: "A reviewed isogeny scheme falls to a new attack." },
  { year: "2024", title: "FIPS 203/204/205", detail: "ML-KEM, ML-DSA and SLH-DSA standardised." },
  { year: "2025", title: "HQC selected", detail: "Additional code-based KEM on the track." },
  { year: "2026", title: "IR 8547 final", detail: "NIST publishes the transition timeline and accelerated federal milestones." },
  { year: "2030/31/35", title: "Federal milestones", detail: "High-value key establishment, signatures, then broader public-key deprecation." },
];

export function QuantumTimeline() {
  const player = useSequencePlayer(EVENTS.length, 2800);

  return (
    <div className="rounded-xl border border-line bg-mist-50 p-4">
      <div className="relative">
        <div className="absolute left-0 right-0 top-5 h-px bg-line" />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {EVENTS.map((event, index) => (
            <li
              key={event.year}
              className={`relative rounded-xl border bg-white p-3 transition-colors ${
                index === player.step ? "border-brand-300 ring-2 ring-brand-200/70" : "border-line"
              }`}
              aria-current={index === player.step ? "step" : undefined}
            >
              <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700">
                {event.year}
              </span>
              <p className="mt-2 text-[11px] font-bold text-navy">{event.title}</p>
              <p className="mt-1 text-[9px] leading-4 text-muted">{event.detail}</p>
            </li>
          ))}
        </ol>
      </div>
      <SequenceControls
        label="post-quantum migration timeline"
        step={player.step}
        length={EVENTS.length}
        playing={player.playing}
        onSelect={player.select}
        onToggle={player.toggle}
        onRestart={player.restart}
      />
      <p className="mt-3 text-center text-[9px] leading-4 text-muted">
        The migration deadline is driven by data lifetime, not by the arrival date of a quantum computer.{" "}
        <Cite id="nist-ir8547" locator="§1 and §4" />
      </p>
    </div>
  );
}
