"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Network, Scale, Shield, Users } from "lucide-react";

const NODES = [
  { id: "a", x: 80, y: 90 },
  { id: "b", x: 190, y: 48 },
  { id: "c", x: 300, y: 90 },
  { id: "d", x: 190, y: 150 },
  { id: "e", x: 70, y: 175 },
  { id: "f", x: 315, y: 172 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 3], [1, 3], [2, 5], [5, 3],
];

export function CentralisationSpectrum() {
  const [value, setValue] = useState(30);
  const decentralised = value / 100;

  const properties = [
    {
      label: "Resilience",
      value: Math.round(20 + decentralised * 75),
      icon: Shield,
      detail: "No single point of failure, but more coordination paths.",
    },
    {
      label: "Coordination cost",
      value: Math.round(20 + decentralised * 75),
      icon: Users,
      detail: "Consensus, membership and upgrade coordination grow with decentralisation.",
    },
    {
      label: "Consistency",
      value: Math.round(95 - decentralised * 55),
      icon: Scale,
      detail: "Strong consistency is easier with a central authority; partitions force trade-offs.",
    },
    {
      label: "Control & governance",
      value: Math.round(95 - decentralised * 65),
      icon: Building2,
      detail: "Who can freeze, censor, upgrade or recover an account?",
    },
  ];

  const label = value < 33 ? "Centralised" : value < 67 ? "Hybrid / federated" : "Decentralised";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy">
          <Network className="h-4 w-4 text-brand-600" /> {label}
        </div>
        <div className="flex gap-1.5">
          {[
            { label: "Central", value: 10 },
            { label: "Hybrid", value: 50 },
            { label: "Mesh", value: 90 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setValue(preset.value)}
              aria-pressed={value === preset.value}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${
                value === preset.value ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-body"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <svg viewBox="0 0 390 220" className="w-full" role="img" aria-label="Centralised versus decentralised network topology">
            {EDGES.map(([from, to], index) => (
              <line
                key={index}
                x1={NODES[from].x}
                y1={NODES[from].y}
                x2={NODES[to].x}
                y2={NODES[to].y}
                stroke="rgba(108,77,246,0.22)"
                strokeWidth="1"
                opacity={0.25 + decentralised * 0.75}
              />
            ))}
            <motion.g animate={{ opacity: 0.25 + (1 - decentralised) * 0.75 }}>
              <circle cx="190" cy="100" r="31" fill="rgba(108,77,246,0.10)" stroke="#6C4DF6" strokeWidth="1.5" />
              <text x="190" y="104" textAnchor="middle" fill="#5B3DD8" fontSize="8" fontFamily="monospace">AUTHORITY</text>
            </motion.g>
            {NODES.map((node, index) => (
              <g key={node.id}>
                <circle cx={node.x} cy={node.y} r="12" fill="#FFFFFF" stroke={index % 2 === 0 ? "#F26B5B" : "#6C4DF6"} strokeWidth="1.4" />
                <text x={node.x} y={node.y + 3} textAnchor="middle" fill="#140342" fontSize="7" fontFamily="monospace">{node.id.toUpperCase()}</text>
              </g>
            ))}
            <text x="195" y="210" textAnchor="middle" fill="#8B88A3" fontSize="8" fontFamily="monospace">
              {decentralised > 0.6 ? "peer-to-peer trust and replication" : decentralised > 0.3 ? "shared control with federated components" : "central server holds authority and state"}
            </text>
          </svg>
        </div>

        <div className="space-y-2">
          {properties.map((property) => {
            const Icon = property.icon;
            return (
              <div key={property.label} className="rounded-lg border border-line bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-body">
                    <Icon className="h-3.5 w-3.5 text-brand-600" /> {property.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{property.value}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist-200">
                  <motion.div
                    animate={{ width: `${property.value}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-coral-400"
                  />
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-muted">{property.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          <span>Centralised</span>
          <span>Decentralised</span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="lab-range mt-2"
          aria-label="Degree of decentralisation"
        />
      </label>
      <p className="mt-2 text-[11px] leading-5 text-muted">
        The bars are qualitative, not measurements. Real systems sit on a spectrum: federated learning is
        decentralised for data but often centralised for aggregation and model release.
      </p>
    </div>
  );
}
