import type { TrackName } from "@/lib/types";

export interface TrackMeta {
  name: TrackName;
  short: string;
  description: string;
  accent: string;
  border: string;
  text: string;
  dot: string;
}

export const TRACKS: TrackMeta[] = [
  {
    name: "Foundations",
    short: "Foundations",
    description:
      "Threat models, public-key primitives, and the quantum algorithms that force the migration.",
    accent: "bg-cyber-cyan/10",
    border: "border-cyber-cyan/30",
    text: "text-cyber-cyan",
    dot: "bg-cyber-cyan",
  },
  {
    name: "Lattice PQC",
    short: "Lattice PQC",
    description:
      "Module-LWE, polynomial rings, NTT arithmetic, and the ML-KEM / ML-DSA standards.",
    accent: "bg-cyber-violet/10",
    border: "border-cyber-violet/30",
    text: "text-cyber-violet",
    dot: "bg-cyber-violet",
  },
  {
    name: "Hash-Based Signatures",
    short: "Hash-Based",
    description:
      "Minimal-assumption signatures built from hash functions: WOTS+, FORS, and hypertrees.",
    accent: "bg-cyber-amber/10",
    border: "border-cyber-amber/30",
    text: "text-cyber-amber",
    dot: "bg-cyber-amber",
  },
  {
    name: "Systems & Deployment",
    short: "Systems",
    description:
      "TLS/PKI integration, hybrid key exchange, constant-time code, and hardware side channels.",
    accent: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
];

export const TRACK_ORDER: TrackName[] = TRACKS.map((track) => track.name);

export function getTrack(name: TrackName): TrackMeta {
  return TRACKS.find((track) => track.name === name) ?? TRACKS[0];
}

export const DIFFICULTY_STYLES: Record<string, string> = {
  Introductory: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Intermediate: "border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan",
  Advanced: "border-cyber-rose/30 bg-cyber-rose/10 text-cyber-rose",
};
