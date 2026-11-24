import type { ComponentType } from "react";

export type LabCategory =
  | "Protocols & Cryptography"
  | "Distributed & Privacy"
  | "Network & SOC"
  | "Application & Identity"
  | "Red Team"
  | "Cloud & Supply Chain"
  | "Malware & DFIR"
  | "PQC Mechanisms";

export interface LabDefinition {
  slug: string;
  title: string;
  description: string;
  category: LabCategory;
  course: string;
  load: () => Promise<ComponentType>;
}

export const LAB_CATEGORIES: { name: LabCategory; description: string }[] = [
  { name: "Protocols & Cryptography", description: "KEMs, AEAD, nonces, HMAC/HKDF, zero-knowledge and MPC." },
  { name: "Distributed & Privacy", description: "Consensus, differential privacy, federated learning and trust." },
  { name: "Network & SOC", description: "Packet reassembly, DPI, detection queries, triage and hunting." },
  { name: "Application & Identity", description: "Web attacks, OAuth/OIDC, authorisation and passkeys." },
  { name: "Red Team", description: "Scoped ranges, request tracing and offensive tooling." },
  { name: "Cloud & Supply Chain", description: "Cloud attack paths, build provenance, SBOMs and signing." },
  { name: "Malware & DFIR", description: "Malware triage, reverse engineering, rootkits and forensic timelines." },
  { name: "PQC Mechanisms", description: "Quantum attacks, NTT arithmetic, ML-KEM, ML-DSA, SLH-DSA and power traces." },
];

export const LABS: LabDefinition[] = [
  { slug: "kem-protocol", title: "KEM protocol state machine", description: "Step through KeyGen, Encaps, Decaps and implicit rejection.", category: "Protocols & Cryptography", course: "/learn/asymmetric-primitives/", load: () => import("@/components/visualizers/KemProtocolLab").then((m) => m.KemProtocolLab) },
  { slug: "hybrid-combiner", title: "Hybrid KEM combiner", description: "Combine classical and post-quantum secrets, then break one component.", category: "Protocols & Cryptography", course: "/learn/tls-pki/", load: () => import("@/components/visualizers/HybridCombinerLab").then((m) => m.HybridCombinerLab) },
  { slug: "aead-tamper", title: "AEAD tamper bench", description: "Encrypt with AES-GCM and flip ciphertext bits to test authentication.", category: "Protocols & Cryptography", course: "/learn/symmetric-crypto/", load: () => import("@/components/visualizers/AeadDemo").then((m) => m.AeadDemo) },
  { slug: "nonce-reuse", title: "Nonce reuse laboratory", description: "See how one reused nonce exposes plaintext relationships and tag security.", category: "Protocols & Cryptography", course: "/learn/symmetric-crypto/", load: () => import("@/components/visualizers/NonceReuseLab").then((m) => m.NonceReuseLab) },
  { slug: "hmac-hkdf", title: "HMAC & HKDF workbench", description: "Inspect pads, tags, extraction, expansion and domain separation.", category: "Protocols & Cryptography", course: "/learn/hashing-mac-kdf/", load: () => import("@/components/visualizers/HmacHkdfLab").then((m) => m.HmacHkdfLab) },
  { slug: "schnorr-proof", title: "Schnorr proof simulator", description: "Commit, challenge, respond and verify a toy proof of knowledge.", category: "Protocols & Cryptography", course: "/learn/zero-knowledge-mpc/", load: () => import("@/components/visualizers/ZkSchnorrDemo").then((m) => m.ZkSchnorrDemo) },
  { slug: "mpc-sharing", title: "MPC secret-sharing lab", description: "Split, reveal and reconstruct a secret under a threshold model.", category: "Protocols & Cryptography", course: "/learn/zero-knowledge-mpc/", load: () => import("@/components/visualizers/MpcSecretSharingLab").then((m) => m.MpcSecretSharingLab) },
  { slug: "consensus-round", title: "Byzantine consensus round", description: "Run a PBFT-style round with one lying replica and inspect quorums.", category: "Distributed & Privacy", course: "/learn/centralised-decentralised/", load: () => import("@/components/visualizers/ConsensusRoundLab").then((m) => m.ConsensusRoundLab) },
  { slug: "differential-privacy", title: "Differential privacy budget", description: "Explore clipping, noise, composition and utility trade-offs.", category: "Distributed & Privacy", course: "/learn/federated-learning/", load: () => import("@/components/visualizers/DifferentialPrivacyLab").then((m) => m.DifferentialPrivacyLab) },
  { slug: "federated-learning", title: "Federated poisoning simulator", description: "Compare centralised, federated and secure-aggregation threat models.", category: "Distributed & Privacy", course: "/learn/federated-learning/", load: () => import("@/components/visualizers/FederatedLearningDemo").then((m) => m.FederatedLearningDemo) },
  { slug: "centralisation-spectrum", title: "Centralisation spectrum", description: "Move from a single authority to a peer mesh and compare trade-offs.", category: "Distributed & Privacy", course: "/learn/centralised-decentralised/", load: () => import("@/components/visualizers/CentralisationSpectrum").then((m) => m.CentralisationSpectrum) },
  { slug: "packet-reassembly", title: "Packet reassembly & evasion", description: "Scramble, drop and time out fragments to see what DPI can reconstruct.", category: "Network & SOC", course: "/learn/deep-packet-inspection/", load: () => import("@/components/visualizers/PacketReassemblyLab").then((m) => m.PacketReassemblyLab) },
  { slug: "dpi-pipeline", title: "DPI pipeline explorer", description: "Follow a packet through capture, decode, flow, detection and action.", category: "Network & SOC", course: "/learn/deep-packet-inspection/", load: () => import("@/components/visualizers/DpiPipeline").then((m) => m.DpiPipeline) },
  { slug: "detection-query", title: "Detection query builder", description: "Combine event fields, tune thresholds and measure precision/recall.", category: "Network & SOC", course: "/learn/soc-operations/", load: () => import("@/components/visualizers/DetectionQueryLab").then((m) => m.DetectionQueryLab) },
  { slug: "soc-triage", title: "SOC alert triage queue", description: "Decide true versus false positive and inspect the reasoning.", category: "Network & SOC", course: "/learn/soc-operations/", load: () => import("@/components/visualizers/SocTriage").then((m) => m.SocTriage) },
  { slug: "blue-team-hunt", title: "Threat-hunting workbench", description: "Turn a hypothesis into data sources, query, ATT&CK mapping and response.", category: "Network & SOC", course: "/learn/blue-team-threat-hunting/", load: () => import("@/components/visualizers/BlueTeamHuntLab").then((m) => m.BlueTeamHuntLab) },
  { slug: "web-security", title: "Web attack & defence pipeline", description: "Trace SQLi, XSS, SSRF and path traversal through trust boundaries.", category: "Application & Identity", course: "/learn/web-application-security/", load: () => import("@/components/visualizers/WebSecurityLab").then((m) => m.WebSecurityLab) },
  { slug: "identity-flow", title: "OIDC + PKCE flow", description: "Validate redirects, state, nonce, audience and token replay.", category: "Application & Identity", course: "/learn/identity-access-management/", load: () => import("@/components/visualizers/IdentityFlowLab").then((m) => m.IdentityFlowLab) },
  { slug: "red-team-range", title: "Scoped red-team range", description: "Move through an authorised toy engagement with evidence and cleanup.", category: "Red Team", course: "/learn/red-team-penetration-testing/", load: () => import("@/components/visualizers/RedTeamRangeLab").then((m) => m.RedTeamRangeLab) },
  { slug: "web-exploit-tooling", title: "Web exploitation tooling", description: "Capture, mutate, compare and report safe web attack hypotheses.", category: "Red Team", course: "/learn/web-exploitation-offensive-tooling/", load: () => import("@/components/visualizers/WebExploitToolingLab").then((m) => m.WebExploitToolingLab) },
  { slug: "cloud-attack-path", title: "Cloud attack-path explorer", description: "Connect IAM, storage, workload and data misconfigurations.", category: "Cloud & Supply Chain", course: "/learn/cloud-container-security/", load: () => import("@/components/visualizers/CloudAttackPathLab").then((m) => m.CloudAttackPathLab) },
  { slug: "supply-chain", title: "Software supply-chain pipeline", description: "Attack dependencies, CI, SBOMs, signatures and provenance.", category: "Cloud & Supply Chain", course: "/learn/secure-software-supply-chain/", load: () => import("@/components/visualizers/SupplyChainLab").then((m) => m.SupplyChainLab) },
  { slug: "malware-triage", title: "Malware triage workbench", description: "Combine static, dynamic, memory and YARA evidence.", category: "Malware & DFIR", course: "/learn/malware-endpoint-forensics/", load: () => import("@/components/visualizers/MalwareTriageLab").then((m) => m.MalwareTriageLab) },
  { slug: "malware-reverse", title: "Reverse-engineering & ML bench", description: "Inspect toy disassembly, features, similarity and classifier quality.", category: "Malware & DFIR", course: "/learn/malware-reverse-engineering-data-science/", load: () => import("@/components/visualizers/MalwareReverseLab").then((m) => m.MalwareReverseLab) },
  { slug: "rootkit-bootkit", title: "Rootkit & bootkit explorer", description: "Compare user, kernel, bootloader and UEFI persistence and visibility.", category: "Malware & DFIR", course: "/learn/rootkits-bootkits/", load: () => import("@/components/visualizers/RootkitBootkitLab").then((m) => m.RootkitBootkitLab) },
  { slug: "dfir-timeline", title: "DFIR evidence timeline", description: "Acquire, hash and correlate memory, disk, logs and file metadata.", category: "Malware & DFIR", course: "/learn/digital-forensics-incident-response/", load: () => import("@/components/visualizers/DfirTimelineLab").then((m) => m.DfirTimelineLab) },
  { slug: "quantum-attack", title: "Quantum attack stages", description: "Compare Shor order finding with Grover amplitude amplification.", category: "PQC Mechanisms", course: "/learn/quantum-threat/", load: () => import("@/components/visualizers/QuantumAttackLab").then((m) => m.QuantumAttackLab) },
  { slug: "polynomial-convolution", title: "Negacyclic convolution lab", description: "Multiply toy polynomials and inspect wrap-around sign changes.", category: "PQC Mechanisms", course: "/learn/ntt-polynomials/", load: () => import("@/components/visualizers/PolynomialConvolutionLab").then((m) => m.PolynomialConvolutionLab) },
  { slug: "mlkem-noise", title: "ML-KEM noise budget", description: "Accumulate noise, compression error and reconciliation margin.", category: "PQC Mechanisms", course: "/learn/ml-kem/", load: () => import("@/components/visualizers/MlKemNoiseBudgetLab").then((m) => m.MlKemNoiseBudgetLab) },
  { slug: "mldsa-hint", title: "ML-DSA hint recovery", description: "Inspect high/low decomposition, hints and verification failure.", category: "PQC Mechanisms", course: "/learn/ml-dsa/", load: () => import("@/components/visualizers/MlDsaHintLab").then((m) => m.MlDsaHintLab) },
  { slug: "wots-chain", title: "WOTS+ hash-chain lab", description: "Sign once, attempt reuse and see why one-time keys matter.", category: "PQC Mechanisms", course: "/learn/slh-dsa/", load: () => import("@/components/visualizers/WotsChainLab").then((m) => m.WotsChainLab) },
  { slug: "power-trace", title: "Power-trace correlation", description: "Guess key bytes, vary noise and inspect DPA correlation.", category: "PQC Mechanisms", course: "/learn/side-channel/", load: () => import("@/components/visualizers/PowerTraceLab").then((m) => m.PowerTraceLab) },
];

export function getLab(slug: string): LabDefinition | undefined {
  return LABS.find((lab) => lab.slug === slug);
}
