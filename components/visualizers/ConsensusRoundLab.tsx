"use client";

import { useState } from "react";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { Cite } from "@/components/citations/Cite";
import { SequenceControls } from "@/components/visualizers/SequenceControls";
import { useSequencePlayer } from "@/components/visualizers/useSequencePlayer";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const PHASES = [
  {
    name: "Request",
    detail: "The client sends a signed operation to the current primary, replica 0.",
    messages: 1,
  },
  {
    name: "Pre-prepare",
    detail: "Replica 0 assigns a sequence number and broadcasts the proposed value A to the other replicas.",
    messages: 3,
  },
  {
    name: "Prepare",
    detail: "Each replica validates independently and broadcasts its prepared vote. A Byzantine replica may vote for B instead.",
    messages: 12,
  },
  {
    name: "Commit",
    detail: "Replicas that collected three matching prepare votes broadcast commit votes for the certified value.",
    messages: 12,
  },
  {
    name: "Reply",
    detail: "Every replica replies to the client. Three matching replies for A are enough; a lone B reply is rejected.",
    messages: 4,
  },
];

const NODES = [
  { id: "R0", label: "primary", x: 245, y: 62 },
  { id: "R1", label: "honest", x: 455, y: 62 },
  { id: "R2", label: "honest", x: 455, y: 218 },
  { id: "R3", label: "Byzantine", x: 245, y: 218 },
];

const CLIENT = { x: 70, y: 140 };

function phaseEdges(phase: number): [number, number][] {
  if (phase === 0) return [[-1, 0]];
  if (phase === 1) return [[0, 1], [0, 2], [0, 3]];
  if (phase === 4) return [[0, -1], [1, -1], [2, -1], [3, -1]];
  const edges: [number, number][] = [];
  for (let from = 0; from < NODES.length; from += 1) {
    for (let to = 0; to < NODES.length; to += 1) {
      if (from !== to) edges.push([from, to]);
    }
  }
  return edges;
}

function point(index: number) {
  return index === -1 ? CLIENT : NODES[index];
}

export function ConsensusRoundLab() {
  const player = useSequencePlayer(PHASES.length, 2600);
  const phase = player.step;
  const [lying, setLying] = useState(false);
  const edges = phaseEdges(phase);
  const messages = PHASES.slice(0, phase + 1).reduce((total, item) => total + item.messages, 0);
  const finished = phase === PHASES.length - 1;

  function reset() {
    player.restart();
    setLying(false);
  }

  function setLyingMode(value: boolean) {
    setLying(value);
    player.select(0);
  }

  return (
    <VisualizerShell
      title="Four replicas, one liar"
      description="A toy PBFT-style round with n = 4, f = 1 and a commit quorum of 3."
      onReset={reset}
      controls={
        <>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-body">
            <input
              type="checkbox"
              checked={lying}
              onChange={(event) => setLyingMode(event.target.checked)}
              className="accent-rose-500"
            />
            R3 lies
          </label>
          <button
            type="button"
            onClick={() => player.select(phase + 1)}
            disabled={finished}
            className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next phase <ArrowRight className="h-3 w-3" />
          </button>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">Quorum arithmetic:</strong> safety needs n ≥ 3f + 1, so four replicas tolerate one Byzantine fault. A quorum is 2f + 1 = 3; any two quorums intersect in at least 3 + 3 − 4 = 2 replicas, including an honest one. Honest replicas never vote for conflicting values at the same position, so conflicting decisions are not possible within this fault bound. This simplified model assumes authenticated point-to-point messages, known membership and a working primary; it illustrates safety, not view-change liveness. <Cite id="castro-liskov1999" locator="§1–4" />
        </span>
      }
    >
      <div className="flex flex-wrap gap-1.5" aria-label="Consensus phases">
        {PHASES.map((item, index) => (
          <StepButton key={item.name} active={phase === index} done={index < phase} onClick={() => player.select(index)}>
            {item.name}
          </StepButton>
        ))}
      </div>

      <SequenceControls
        label="Byzantine consensus round"
        step={player.step}
        length={PHASES.length}
        playing={player.playing}
        onSelect={player.select}
        onToggle={player.toggle}
        onRestart={player.restart}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <svg viewBox="0 0 530 280" className="w-full" role="img" aria-label={`${PHASES[phase].name} messages between a client and four replicas${lying ? ", with replica 3 voting for a conflicting value" : ""}`}>
            <defs>
              <marker id="consensus-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B88A3" />
              </marker>
              <marker id="consensus-arrow-rose" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#E25545" />
              </marker>
            </defs>
            {edges.map(([from, to], index) => {
              const start = point(from);
              const end = point(to);
              const byzantine = lying && phase >= 2 && from === 3;
              return (
                <line
                  key={`${from}-${to}-${index}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={byzantine ? "#E25545" : "#B9B2D4"}
                  strokeWidth={byzantine ? 2 : 1.2}
                  strokeDasharray={byzantine ? "5 4" : phase >= 2 && phase <= 3 ? "3 4" : undefined}
                  markerEnd={`url(#${byzantine ? "consensus-arrow-rose" : "consensus-arrow"})`}
                  opacity={0.8}
                />
              );
            })}
            <circle cx={CLIENT.x} cy={CLIENT.y} r="29" fill="#FFFFFF" stroke="#6C4DF6" strokeWidth="1.5" />
            <text x={CLIENT.x} y={CLIENT.y - 2} textAnchor="middle" fill="#140342" fontSize="10" fontWeight="700">Client</text>
            <text x={CLIENT.x} y={CLIENT.y + 12} textAnchor="middle" fill="#8B88A3" fontSize="8">value A</text>
            {NODES.map((node, index) => {
              const byzantine = index === 3;
              const conflicting = byzantine && lying && phase >= 2;
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="34"
                    fill={conflicting ? "#FFF2F0" : "#FFFFFF"}
                    stroke={conflicting ? "#E25545" : byzantine ? "#C97F0E" : "#6C4DF6"}
                    strokeWidth="1.5"
                  />
                  <text x={node.x} y={node.y - 3} textAnchor="middle" fill="#140342" fontSize="11" fontWeight="700">{node.id}</text>
                  <text x={node.x} y={node.y + 11} textAnchor="middle" fill={conflicting ? "#C24134" : "#8B88A3"} fontSize="8">
                    {conflicting ? "votes B" : node.label}
                  </text>
                </g>
              );
            })}
            <text x="265" y="145" textAnchor="middle" fill="#8B88A3" fontSize="8">
              {phase === 0 ? "1 request" : phase === 1 ? "3 pre-prepares" : phase === 2 || phase === 3 ? "12 broadcast votes" : "4 replies"}
            </text>
          </svg>
          <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-semibold">
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-brand-700">A · proposed value</span>
            <span className={`rounded-full border px-2.5 py-1 ${lying ? "border-rose-200 bg-rose-50 text-rose-700" : "border-line bg-white text-muted"}`}>
              B · conflicting value {lying ? "sent by R3" : "not sent"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Messages so far" value={messages} />
            <Metric label="Commit quorum" value="3 / 4" tone="teal" />
            <Metric label="Minimum overlap" value="2 replicas" tone="gold" />
            <Metric label="Conflicting decisions" value="Impossible" tone="teal" />
          </div>
          <div className={`rounded-xl border p-3 ${lying ? "border-rose-200 bg-rose-50" : "border-brand-200 bg-brand-50"}`} aria-live={player.playing ? "off" : "polite"}>
            <div className="flex items-start gap-2">
              {lying ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${lying ? "text-rose-700" : "text-brand-700"}`}>
                  {PHASES[phase].name} · {PHASES[phase].messages} message{PHASES[phase].messages === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-body">{PHASES[phase].detail}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Client outcome</p>
            <p className="mt-1 font-mono text-sm font-bold text-navy">
              {finished ? (lying ? "commit A · 3 matching, 1 dissenting" : "commit A · 4 matching") : "waiting for quorum"}
            </p>
            <p className="mt-1 text-[10px] leading-4 text-muted">
              R3 alone cannot create a second three-vote quorum for B without an honest replica voting twice.
            </p>
          </div>
        </div>
      </div>
    </VisualizerShell>
  );
}
