"use client";

import { motion } from "framer-motion";

const NODES = [
  { id: "a", x: 96, y: 72, label: "LWE", accent: "#22d3ee" },
  { id: "b", x: 268, y: 46, label: "NTT", accent: "#a78bfa" },
  { id: "c", x: 352, y: 172, label: "KEM", accent: "#2dd4bf" },
  { id: "d", x: 212, y: 250, label: "FO", accent: "#fbbf24" },
  { id: "e", x: 62, y: 206, label: "Σ", accent: "#60a5fa" },
];

const EDGES: [string, string][] = [
  ["a", "b"],
  ["b", "c"],
  ["c", "d"],
  ["d", "e"],
  ["e", "a"],
  ["a", "c"],
  ["b", "d"],
];

function find(id: string) {
  return NODES.find((node) => node.id === id)!;
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute inset-10 rounded-full bg-cyber-cyan/10 blur-3xl" />
      <div className="absolute inset-16 rounded-full bg-cyber-violet/10 blur-3xl" />
      <svg viewBox="0 0 420 320" className="relative w-full" role="img" aria-label="Animated lattice, NTT and KEM dependency graph">
        <defs>
          <linearGradient id="hero-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.6" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="hero-core">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="160" r="96" fill="url(#hero-core)" />

        {EDGES.map(([from, to], index) => {
          const a = find(from);
          const b = find(to);
          return (
            <g key={`${from}-${to}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#hero-edge)" strokeWidth="1" />
              <motion.circle
                cx={a.x}
                cy={a.y}
                r="2.4"
                fill={index % 2 === 0 ? "#22d3ee" : "#a78bfa"}
                initial={{ opacity: 0, cx: a.x, cy: a.y }}
                animate={{ opacity: [0, 1, 0], cx: [a.x, b.x], cy: [a.y, b.y] }}
                transition={{ duration: 2.4 + index * 0.3, repeat: Infinity, delay: index * 0.5, ease: "easeInOut" }}
              />
            </g>
          );
        })}

        {NODES.map((node, index) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <circle cx={node.x} cy={node.y} r="20" fill="#070b16" stroke={node.accent} strokeWidth="1.2" />
            <circle cx={node.x} cy={node.y} r="26" fill="none" stroke={node.accent} strokeOpacity="0.15" />
            <text x={node.x} y={node.y + 3.5} textAnchor="middle" fill={node.accent} fontSize="8" fontFamily="monospace">
              {node.label}
            </text>
          </motion.g>
        ))}

        <motion.circle
          cx="210"
          cy="160"
          r="34"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.35"
          initial={{ r: 30, opacity: 0.5 }}
          animate={{ r: [30, 44], opacity: [0.5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
        />
        <circle cx="210" cy="160" r="17" fill="#0b1020" stroke="#22d3ee" strokeWidth="1.5" />
        <path d="M204 160l4 4 8-9" fill="none" stroke="#22d3ee" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="absolute -bottom-2 left-2 rounded-lg border border-white/10 bg-ink-900/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400 backdrop-blur">
        <span className="text-cyber-cyan">L3</span> math · <span className="text-cyber-cyan">L4</span> machine
      </div>
      <div className="absolute -top-1 right-0 rounded-lg border border-white/10 bg-ink-900/90 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400 backdrop-blur">
        <span className="text-emerald-300">L1</span> intuition → <span className="text-cyber-violet">L3</span> proofs
      </div>
    </div>
  );
}
