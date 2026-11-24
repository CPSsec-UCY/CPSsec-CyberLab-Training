import type { TrackName } from "@/lib/types";

export interface TrackMeta {
  name: TrackName;
  short: string;
  description: string;
  icon: "shield" | "atom" | "network" | "share" | "activity" | "cpu" | "key" | "code" | "cloud" | "bug" | "package" | "fingerprint" | "crosshair" | "search";
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
    name: "Red Team",
    short: "Red Team",
    description: "Scoped penetration testing, safe lab methodology, web exploitation, binary reasoning and offensive tooling.",
    icon: "crosshair",
    accent: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
    cover: "from-rose-100 via-rose-50 to-white",
  },
  {
    name: "Application Security",
    short: "AppSec",
    description: "Web attacks, input validation, access control, secure coding, testing and remediation.",
    icon: "code",
    accent: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
    cover: "from-orange-100 via-orange-50 to-white",
  },
  {
    name: "Identity & Access",
    short: "Identity",
    description: "OAuth, OIDC, WebAuthn, JWT, authorisation, session security and identity lifecycle.",
    icon: "fingerprint",
    accent: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    text: "text-fuchsia-700",
    dot: "bg-fuchsia-500",
    cover: "from-fuchsia-100 via-fuchsia-50 to-white",
  },
  {
    name: "Cloud & Infrastructure",
    short: "Cloud",
    description: "Cloud shared responsibility, IAM, containers, Kubernetes, microservices and infrastructure attacks.",
    icon: "cloud",
    accent: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
    cover: "from-sky-100 via-sky-50 to-white",
  },
  {
    name: "Malware & Forensics",
    short: "Malware",
    description: "Static and dynamic malware analysis, endpoint telemetry, memory forensics and evidence handling.",
    icon: "bug",
    accent: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    cover: "from-red-100 via-red-50 to-white",
  },
  {
    name: "Software Supply Chain",
    short: "Supply Chain",
    description: "Secure development, dependency risk, SBOMs, provenance, signing and build pipeline defence.",
    icon: "package",
    accent: "bg-lime-50",
    border: "border-lime-200",
    text: "text-lime-700",
    dot: "bg-lime-500",
    cover: "from-lime-100 via-lime-50 to-white",
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
    name: "Digital Forensics & Incident Response",
    short: "DFIR",
    description: "Memory, filesystem and timeline forensics, evidence integrity, incident handling and defensible reporting.",
    icon: "search",
    accent: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
    cover: "from-cyan-100 via-cyan-50 to-white",
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
