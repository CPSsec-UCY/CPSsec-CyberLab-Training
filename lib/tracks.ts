import type { TrackName } from "@/lib/types";

export interface TrackMeta {
  name: TrackName;
  short: string;
  description: string;
  icon: "shield" | "atom" | "network" | "share" | "activity" | "cpu" | "key";
  accent: string;
  border: string;
  text: string;
  dot: string;
  cover: string;
}

export const TRACKS: TrackMeta[] = [
  {
    name: "Foundations",
    short: "Foundations",
    description: "Threat models, public-key and symmetric primitives, hashing, keys and security notions.",
    icon: "shield",
    accent: "bg-brand-50",
    border: "border-brand-200",
    text: "text-brand-700",
    dot: "bg-brand-500",
    cover: "from-brand-100 via-brand-50 to-white",
  },
  {
    name: "Post-Quantum Cryptography",
    short: "Post-Quantum",
    description: "Quantum risk, lattice arithmetic, ML-KEM, ML-DSA, SLH-DSA and the migration to PQC.",
    icon: "atom",
    accent: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-500",
    cover: "from-teal-100 via-teal-50 to-white",
  },
  {
    name: "Network & Protocol Security",
    short: "Networks",
    description: "TLS, PKI, deep packet inspection, traffic analysis, middleboxes and network defence.",
    icon: "network",
    accent: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    cover: "from-blue-100 via-blue-50 to-white",
  },
  {
    name: "Distributed Systems & Privacy",
    short: "Distributed",
    description: "Centralised versus decentralised trust, federated learning, secure aggregation and privacy.",
    icon: "share",
    accent: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    dot: "bg-violet-500",
    cover: "from-violet-100 via-violet-50 to-white",
  },
  {
    name: "Security Operations",
    short: "SOC",
    description: "Detection engineering, SIEM, alert triage, incident response, threat hunting and metrics.",
    icon: "activity",
    accent: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    cover: "from-amber-100 via-amber-50 to-white",
  },
  {
    name: "Systems & Hardware",
    short: "Systems",
    description: "Constant-time code, side channels, faults, secure boot, hardware and implementation reality.",
    icon: "cpu",
    accent: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
    cover: "from-rose-100 via-rose-50 to-white",
  },
  {
    name: "Advanced Cryptography",
    short: "Advanced Crypto",
    description: "Zero-knowledge proofs, secure multi-party computation, secret sharing and privacy technology.",
    icon: "key",
    accent: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    cover: "from-indigo-100 via-indigo-50 to-white",
  },
];

export const TRACK_ORDER: TrackName[] = TRACKS.map((track) => track.name);

export function getTrack(name: TrackName): TrackMeta {
  return TRACKS.find((track) => track.name === name) ?? TRACKS[0];
}

export const DIFFICULTY_STYLES: Record<string, string> = {
  Introductory: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Intermediate: "border-brand-200 bg-brand-50 text-brand-700",
  Advanced: "border-rose-200 bg-rose-50 text-rose-700",
};
