import type { LensLevel } from "@/lib/types";

export interface LensMeta {
  level: LensLevel;
  name: string;
  short: string;
  audience: string;
  description: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  dot: string;
}

export const LENSES: LensMeta[] = [
  {
    level: 1,
    name: "Intuition & Threat Model",
    short: "Intuition",
    audience: "Beginners, product and security generalists",
    description: "Visual mental models, attacker and defender goals, real-world failure modes, zero heavy maths.",
    accentText: "text-emerald-300",
    accentBg: "bg-emerald-400/10",
    accentBorder: "border-emerald-400/30",
    dot: "bg-emerald-400",
  },
  {
    level: 2,
    name: "Protocol & System Mechanics",
    short: "Mechanics",
    audience: "Practitioners, engineers, students",
    description: "Message flows, state machines, memory and network layouts, configuration trade-offs, common pitfalls.",
    accentText: "text-cyber-cyan",
    accentBg: "bg-cyber-cyan/10",
    accentBorder: "border-cyber-cyan/30",
    dot: "bg-cyber-cyan",
  },
  {
    level: 3,
    name: "Formal Math & Correctness",
    short: "Math",
    audience: "Cryptographers, researchers, advanced learners",
    description: "Definitions, algebraic structures, probability bounds, reduction sketches, correctness and security proofs.",
    accentText: "text-cyber-violet",
    accentBg: "bg-cyber-violet/10",
    accentBorder: "border-cyber-violet/30",
    dot: "bg-cyber-violet",
  },
  {
    level: 4,
    name: "Implementation & Hardware",
    short: "Systems",
    audience: "Systems and crypto engineers, hardware designers",
    description: "Constant-time code, SIMD/NTT/hardware acceleration, side-channel and fault countermeasures.",
    accentText: "text-cyber-amber",
    accentBg: "bg-cyber-amber/10",
    accentBorder: "border-cyber-amber/30",
    dot: "bg-cyber-amber",
  },
];

export function getLens(level: LensLevel): LensMeta {
  return LENSES.find((lens) => lens.level === level) ?? LENSES[0];
}
