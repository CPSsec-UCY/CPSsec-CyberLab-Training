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
    accentText: "text-teal-700",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
    dot: "bg-teal-500",
  },
  {
    level: 2,
    name: "Protocol & System Mechanics",
    short: "Mechanics",
    audience: "Practitioners, engineers, students",
    description: "Message flows, state machines, memory and network layouts, configuration trade-offs, common pitfalls.",
    accentText: "text-brand-700",
    accentBg: "bg-brand-50",
    accentBorder: "border-brand-200",
    dot: "bg-brand-500",
  },
  {
    level: 3,
    name: "Formal Math & Correctness",
    short: "Math",
    audience: "Cryptographers, researchers, advanced learners",
    description: "Definitions, algebraic structures, probability bounds, reduction sketches, correctness and security proofs.",
    accentText: "text-coral-600",
    accentBg: "bg-coral-50",
    accentBorder: "border-coral-200",
    dot: "bg-coral-500",
  },
  {
    level: 4,
    name: "Implementation & Hardware",
    short: "Systems",
    audience: "Systems and crypto engineers, hardware designers",
    description: "Constant-time code, SIMD/NTT/hardware acceleration, side-channel and fault countermeasures.",
    accentText: "text-gold-600",
    accentBg: "bg-gold-50",
    accentBorder: "border-gold-200",
    dot: "bg-gold-400",
  },
];

export function getLens(level: LensLevel): LensMeta {
  return LENSES.find((lens) => lens.level === level) ?? LENSES[0];
}
