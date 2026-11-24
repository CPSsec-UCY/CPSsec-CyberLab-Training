"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type WeaknessKey = "publicStorage" | "overPrivilegedIam" | "exposedContainer" | "stolenServiceToken" | "insecureK8sRbac";
type NodeId = "internet" | "storage" | "iam" | "container" | "workload" | "kubernetes" | "token" | "secrets" | "data";

interface Weakness {
  key: WeaknessKey;
  label: string;
  detail: string;
  mitigation: string;
}

interface GraphNode {
  id: NodeId;
  label: string;
  detail: string;
  x: number;
  y: number;
  width: number;
}

interface AttackEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  requires: WeaknessKey[];
  technique: string;
  shortTechnique: string;
  action: string;
  mitigation: string;
}

const WEAKNESSES: Weakness[] = [
  {
    key: "publicStorage",
    label: "Public storage",
    detail: "An object bucket is readable without an authenticated session.",
    mitigation: "Enable public-access blocks, enforce bucket policies and review object-level ACLs.",
  },
  {
    key: "overPrivilegedIam",
    label: "Over-privileged IAM",
    detail: "A workload role can read unrelated secrets and storage.",
    mitigation: "Apply least privilege, scope resource ARNs and remove standing wildcard permissions.",
  },
  {
    key: "exposedContainer",
    label: "Exposed container",
    detail: "A workload is reachable from an untrusted network.",
    mitigation: "Put the workload behind an authenticated gateway and restrict ingress with network policy.",
  },
  {
    key: "stolenServiceToken",
    label: "Stolen service token",
    detail: "A bearer token can be replayed outside its intended workload.",
    mitigation: "Use short-lived workload identity, audience binding and rapid token revocation.",
  },
  {
    key: "insecureK8sRbac",
    label: "Insecure K8s RBAC",
    detail: "A service account can read secrets or create privileged pods.",
    mitigation: "Remove wildcard verbs, bind roles to namespaces and disable automounting by default.",
  },
];

const NODES: GraphNode[] = [
  { id: "internet", label: "Internet", detail: "untrusted origin", x: 20, y: 145, width: 125 },
  { id: "storage", label: "Object storage", detail: "files & artefacts", x: 185, y: 25, width: 135 },
  { id: "iam", label: "Cloud IAM", detail: "roles & sessions", x: 185, y: 145, width: 135 },
  { id: "container", label: "Container", detail: "public workload", x: 185, y: 265, width: 135 },
  { id: "workload", label: "Workload", detail: "compute identity", x: 375, y: 145, width: 135 },
  { id: "kubernetes", label: "Kubernetes API", detail: "RBAC boundary", x: 375, y: 25, width: 135 },
  { id: "token", label: "Service token", detail: "replayable bearer", x: 375, y: 265, width: 135 },
  { id: "secrets", label: "Secrets", detail: "keys & credentials", x: 575, y: 145, width: 135 },
  { id: "data", label: "Sensitive data", detail: "business objective", x: 765, y: 145, width: 150 },
];

const EDGES: AttackEdge[] = [
  {
    id: "storage-iam",
    from: "storage",
    to: "iam",
    requires: ["publicStorage", "overPrivilegedIam"],
    technique: "T1552.001 · Credentials in Files",
    shortTechnique: "T1552.001",
    action: "Download a deployment archive containing a reusable cloud credential.",
    mitigation: "Never store live credentials in objects; scan repositories and rotate exposed material.",
  },
  {
    id: "storage-workload",
    from: "storage",
    to: "workload",
    requires: ["publicStorage", "exposedContainer"],
    technique: "T1525 · Implant Internal Image",
    shortTechnique: "T1525",
    action: "Replace a publicly retrievable workload artefact with an attacker-controlled build.",
    mitigation: "Sign images, pin digests and admit only verified artefacts from trusted registries.",
  },
  {
    id: "iam-workload",
    from: "iam",
    to: "workload",
    requires: ["overPrivilegedIam"],
    technique: "T1078 · Valid Accounts",
    shortTechnique: "T1078",
    action: "Assume the workload role and use its legitimate cloud permissions.",
    mitigation: "Bind roles to one workload, add trust conditions and alert on anomalous role assumptions.",
  },
  {
    id: "container-workload",
    from: "container",
    to: "workload",
    requires: ["exposedContainer"],
    technique: "T1190 · Exploit Public-Facing Application",
    shortTechnique: "T1190",
    action: "Exploit the exposed service to execute code inside the workload.",
    mitigation: "Patch the service, run non-root with a read-only filesystem and enforce admission policy.",
  },
  {
    id: "workload-kubernetes",
    from: "workload",
    to: "kubernetes",
    requires: ["insecureK8sRbac"],
    technique: "T1552.007 · Container API Credentials",
    shortTechnique: "T1552.007",
    action: "Reuse the mounted service-account token against the Kubernetes API.",
    mitigation: "Disable unnecessary token automounting and issue projected, audience-bound short-lived tokens.",
  },
  {
    id: "workload-secrets",
    from: "workload",
    to: "secrets",
    requires: ["overPrivilegedIam"],
    technique: "T1552.001 · Credentials in Files",
    shortTechnique: "T1552.001",
    action: "Read an unrelated secret using the workload's broad cloud role.",
    mitigation: "Scope secret-read permissions to the owning application and audit every access.",
  },
  {
    id: "kubernetes-secrets",
    from: "kubernetes",
    to: "secrets",
    requires: ["insecureK8sRbac"],
    technique: "T1528 · Steal Application Access Token",
    shortTechnique: "T1528",
    action: "Use an over-broad RoleBinding to retrieve credentials from the namespace.",
    mitigation: "Remove secret-list and secret-get wildcards; use narrowly scoped roles and external secret delivery.",
  },
  {
    id: "secrets-data",
    from: "secrets",
    to: "data",
    requires: ["overPrivilegedIam", "insecureK8sRbac"],
    technique: "T1530 · Data from Cloud Storage",
    shortTechnique: "T1530",
    action: "Use a recovered credential to read the protected business dataset.",
    mitigation: "Separate secret administration from data access, rotate credentials and review resource policies.",
  },
  {
    id: "workload-data",
    from: "workload",
    to: "data",
    requires: ["overPrivilegedIam"],
    technique: "T1005 · Data from Local System",
    shortTechnique: "T1005",
    action: "Read mounted application data that the workload identity should not reach.",
    mitigation: "Minimise mounts, segment storage and enforce per-workload authorisation at the data service.",
  },
  {
    id: "storage-data",
    from: "storage",
    to: "data",
    requires: ["publicStorage"],
    technique: "T1530 · Data from Cloud Storage",
    shortTechnique: "T1530",
    action: "Read sensitive objects directly because public access was never blocked.",
    mitigation: "Deny public access at the account and bucket levels and continuously detect policy drift.",
  },
  {
    id: "internet-storage",
    from: "internet",
    to: "storage",
    requires: ["publicStorage"],
    technique: "T1530 · Data from Cloud Storage",
    shortTechnique: "T1530",
    action: "Enumerate and download objects from the public bucket.",
    mitigation: "Require authenticated access and monitor anonymous object requests.",
  },
  {
    id: "internet-container",
    from: "internet",
    to: "container",
    requires: ["exposedContainer"],
    technique: "T1190 · Exploit Public-Facing Application",
    shortTechnique: "T1190",
    action: "Reach the container directly from an untrusted network.",
    mitigation: "Expose only an authenticated ingress and deny direct pod or container access.",
  },
  {
    id: "internet-iam",
    from: "internet",
    to: "iam",
    requires: ["stolenServiceToken"],
    technique: "T1078 · Valid Accounts",
    shortTechnique: "T1078",
    action: "Replay a stolen bearer credential against the cloud control plane.",
    mitigation: "Use short-lived tokens, sender-constrained credentials and revocation on suspected theft.",
  },
  {
    id: "token-iam",
    from: "token",
    to: "iam",
    requires: ["stolenServiceToken"],
    technique: "T1528 · Steal Application Access Token",
    shortTechnique: "T1528",
    action: "Exchange the stolen token for the service principal's cloud session.",
    mitigation: "Bind tokens to workload identity and audience; monitor token replay from new networks.",
  },
  {
    id: "token-workload",
    from: "token",
    to: "workload",
    requires: ["stolenServiceToken"],
    technique: "T1078 · Valid Accounts",
    shortTechnique: "T1078",
    action: "Authenticate to the workload's internal service as that service.",
    mitigation: "Require mutual authentication and rotate the token after any suspected exposure.",
  },
  {
    id: "token-secrets",
    from: "token",
    to: "secrets",
    requires: ["stolenServiceToken", "overPrivilegedIam"],
    technique: "T1528 · Steal Application Access Token",
    shortTechnique: "T1528",
    action: "Use the stolen service credential to retrieve additional secrets.",
    mitigation: "Constrain token permissions, separate duties and alert on unusual secret access.",
  },
  {
    id: "kubernetes-data",
    from: "kubernetes",
    to: "data",
    requires: ["insecureK8sRbac", "overPrivilegedIam"],
    technique: "T1078 · Valid Accounts",
    shortTechnique: "T1078",
    action: "Create or modify a privileged workload to reach application data.",
    mitigation: "Enforce restricted pod security, separate cluster-admin duties and protect data-service credentials.",
  },
];

const ENTRY_POINTS: { id: NodeId; label: string; requires: WeaknessKey[] }[] = [
  { id: "internet", label: "Internet reconnaissance", requires: [] },
  { id: "storage", label: "Public object storage", requires: ["publicStorage"] },
  { id: "container", label: "Exposed container", requires: ["exposedContainer"] },
  { id: "token", label: "Stolen service token", requires: ["stolenServiceToken"] },
  { id: "kubernetes", label: "Kubernetes API", requires: ["insecureK8sRbac"] },
];

const INITIAL_FLAGS: Record<WeaknessKey, boolean> = {
  publicStorage: true,
  overPrivilegedIam: true,
  exposedContainer: true,
  stolenServiceToken: false,
  insecureK8sRbac: true,
};

function nodeById(id: NodeId) {
  return NODES.find((node) => node.id === id)!;
}

function availableEdges(flags: Record<WeaknessKey, boolean>) {
  return EDGES.filter((edge) => edge.requires.every((key) => flags[key]));
}

function findAttackPath(start: NodeId, edges: AttackEdge[]): AttackEdge[] {
  const visited = new Set<NodeId>();

  function visit(node: NodeId): AttackEdge[] | null {
    if (node === "data") return [];
    visited.add(node);
    for (const edge of edges.filter((candidate) => candidate.from === node)) {
      if (visited.has(edge.to)) continue;
      const suffix = visit(edge.to);
      if (suffix) return [edge, ...suffix];
    }
    visited.delete(node);
    return null;
  }

  return visit(start) ?? [];
}

function reachableNodes(start: NodeId, edges: AttackEdge[]) {
  const reached = new Set<NodeId>([start]);
  const queue: NodeId[] = [start];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges.filter((candidate) => candidate.from === current)) {
      if (!reached.has(edge.to)) {
        reached.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  return reached;
}

export function CloudAttackPathLab() {
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [entryPoint, setEntryPoint] = useState<NodeId>("storage");
  const [step, setStep] = useState(0);

  const edges = availableEdges(flags);
  const path = findAttackPath(entryPoint, edges);
  const reachable = reachableNodes(entryPoint, edges);
  const entry = ENTRY_POINTS.find((candidate) => candidate.id === entryPoint)!;
  const entryAvailable = entry.requires.every((key) => flags[key]);
  const revealedCount = Math.min(step, path.length);
  const revealedEdges = path.slice(0, revealedCount);
  const traversedNodes = new Set<NodeId>([entryPoint, ...revealedEdges.map((edge) => edge.to)]);
  const techniques = [...new Set(revealedEdges.map((edge) => edge.technique))];
  const pathIds = new Set(path.map((edge) => edge.id));
  const blockedEdges = EDGES.filter((edge) => !pathIds.has(edge.id) && !edge.requires.every((key) => flags[key]));
  const dataReachable = reachable.has("data");
  const controlPlaneReachable = reachable.has("kubernetes");
  const secretsReachable = reachable.has("secrets");

  const blastRadius = !entryAvailable
    ? "Entry closed"
    : dataReachable
      ? controlPlaneReachable ? "Critical · data + control plane" : "High · sensitive data"
      : secretsReachable
        ? "High · secrets"
        : reachable.has("workload")
          ? "Moderate · workload"
          : "Contained · entry only";

  function toggleWeakness(key: WeaknessKey, checked: boolean) {
    setFlags((current) => ({ ...current, [key]: checked }));
    if (!checked && entry.requires.includes(key)) setEntryPoint("internet");
    setStep(0);
  }

  function reset() {
    setFlags(INITIAL_FLAGS);
    setEntryPoint("storage");
    setStep(0);
  }

  function nextMove() {
    setStep((current) => Math.min(path.length, current + 1));
  }

  return (
    <VisualizerShell
      title="Cloud attack-path explorer"
      description="Toggle five control failures, choose an entry point and step through a deterministic attack graph."
      onReset={reset}
      controls={
        <>
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-muted">Entry point</span>
            <select
              value={entryPoint}
              onChange={(event) => {
                setEntryPoint(event.target.value as NodeId);
                setStep(0);
              }}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-body"
            >
              {ENTRY_POINTS.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
              ))}
            </select>
          </label>
          <StepButton active={step > 0 && step < path.length} done={step >= path.length && path.length > 0} onClick={nextMove}>
            {step >= path.length && path.length > 0 ? "Path complete" : step === 0 ? "Start path" : "Next move"}
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </StepButton>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">Simulated teaching model:</strong> reachability, likelihood and blast radius are deterministic, not a live cloud assessment. ATT&amp;CK-style technique labels describe behaviour, not proof of compromise. Every route below names the control that breaks its edge.
        </span>
      }
    >
      <div className="rounded-xl border border-line bg-mist-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Control failures to enable</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {WEAKNESSES.map((weakness) => (
            <label
              key={weakness.key}
              className={`cursor-pointer rounded-lg border p-2.5 transition ${flags[weakness.key] ? "border-coral-200 bg-coral-50" : "border-line bg-white"}`}
              title={weakness.detail}
            >
              <span className="flex items-center gap-2 text-[10px] font-bold text-navy">
                <input
                  type="checkbox"
                  checked={flags[weakness.key]}
                  onChange={(event) => toggleWeakness(weakness.key, event.target.checked)}
                  className="accent-coral-600"
                />
                {weakness.label}
              </span>
              <span className="mt-1 block text-[9px] leading-4 text-muted">{weakness.detail}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="Entry status" value={entryAvailable ? "Reachable" : "Blocked"} tone={entryAvailable ? "coral" : "teal"} />
        <Metric label="Moves revealed" value={`${revealedCount} / ${path.length}`} tone="gold" />
        <Metric label="Reachable assets" value={`${reachable.size} / ${NODES.filter((node) => node.id !== "token" || flags.stolenServiceToken).length}`} />
        <Metric label="Blast radius" value={blastRadius} tone={dataReachable ? "rose" : secretsReachable ? "coral" : "gold"} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="overflow-x-auto bg-mist-50/60">
          <svg viewBox="0 0 940 360" className="h-auto w-full min-w-[720px]" role="img" aria-labelledby="cloud-graph-title cloud-graph-description">
            <title id="cloud-graph-title">Cloud attack graph</title>
            <desc id="cloud-graph-description">
              Nodes show internet entry points, storage, IAM, containers, workloads, Kubernetes, service tokens, secrets and sensitive data. Highlighted arrows are enabled attack edges; dashed arrows are blocked by controls.
            </desc>
            <defs>
              <marker id="arrow-attack" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#E25545" /></marker>
              <marker id="arrow-open" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#9B7BFA" /></marker>
              <marker id="arrow-blocked" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#C9C5D8" /></marker>
            </defs>
            {EDGES.map((edge) => {
              if (edge.from === "token" && !flags.stolenServiceToken) return null;
              if (edge.to === "token" && !flags.stolenServiceToken) return null;
              const from = nodeById(edge.from);
              const to = nodeById(edge.to);
              const enabled = edge.requires.every((key) => flags[key]);
              const pathIndex = path.findIndex((candidate) => candidate.id === edge.id);
              const traversed = pathIndex >= 0 && pathIndex < revealedCount;
              const x1 = from.x + from.width / 2;
              const y1 = from.y + 35;
              const x2 = to.x + to.width / 2;
              const y2 = to.y + 35;
              const middleX = (x1 + x2) / 2;
              const middleY = (y1 + y2) / 2;
              const stroke = traversed ? "#E25545" : enabled ? "#9B7BFA" : "#D7D2E8";
              const marker = traversed ? "url(#arrow-attack)" : enabled ? "url(#arrow-open)" : "url(#arrow-blocked)";
              return (
                <g key={edge.id}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={traversed ? 2.6 : 1.4} strokeDasharray={enabled ? undefined : "5 5"} markerEnd={marker} />
                  <rect x={middleX - 31} y={middleY - 9} width="62" height="18" rx="5" fill={traversed ? "#FFF2F0" : enabled ? "#F3F0FF" : "#FBFAFE"} stroke={stroke} strokeWidth="0.7" />
                  <text x={middleX} y={middleY + 3.5} textAnchor="middle" fontSize="8" fontWeight="700" fill={traversed ? "#C24134" : enabled ? "#5B3DD8" : "#8B88A3"}>{edge.shortTechnique}</text>
                </g>
              );
            })}
            {NODES.map((node) => {
              if (node.id === "token" && !flags.stolenServiceToken) return null;
              const isStart = node.id === entryPoint && entryAvailable;
              const isTraversed = traversedNodes.has(node.id) && revealedCount > 0;
              const isReachable = reachable.has(node.id) && entryAvailable;
              const isData = node.id === "data" && isReachable;
              const fill = isTraversed || isData ? "#FFF2F0" : isStart || isReachable ? "#F3F0FF" : "#FFFFFF";
              const stroke = isTraversed || isData ? "#FCA79A" : isStart || isReachable ? "#BCA8FF" : "#E7E4F1";
              return (
                <g key={node.id}>
                  <rect x={node.x} y={node.y} width={node.width} height="70" rx="12" fill={fill} stroke={stroke} strokeWidth={isStart ? 2.4 : 1.4} />
                  <text x={node.x + node.width / 2} y={node.y + 29} textAnchor="middle" fontSize="12" fontWeight="700" fill="#140342">{node.label}</text>
                  <text x={node.x + node.width / 2} y={node.y + 47} textAnchor="middle" fontSize="9" fill="#8B88A3">{node.detail}</text>
                  <text x={node.x + node.width / 2} y={node.y + 61} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={isTraversed ? "#C24134" : isReachable ? "#5B3DD8" : "#8B88A3"}>
                    {isStart ? "ENTRY" : isTraversed ? "TRAVERSED" : isReachable ? "AT RISK" : "NOT REACHED"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-line bg-white px-3 py-2 text-[9px] font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-coral-400" /> traversed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-brand-300" /> reachable but not stepped</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded border border-dashed border-line-strong bg-mist-50" /> control blocks edge</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-line bg-mist-50 p-3" aria-live="polite">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Current attack move</p>
          {!entryAvailable ? (
            <p className="mt-2 text-xs leading-5 text-body">The selected entry point is closed. Enable its prerequisite weakness or choose another origin.</p>
          ) : path.length === 0 ? (
            <p className="mt-2 text-xs leading-5 text-body">No path reaches sensitive data from this entry point. The remaining controls break every available route.</p>
          ) : revealedCount === 0 ? (
            <p className="mt-2 text-xs leading-5 text-body">Starting at <strong>{entry.label}</strong>. Select “Start path” to reveal the first enabled edge, or toggle controls to change the graph.</p>
          ) : (
            <>
              <p className="mt-2 text-xs font-bold text-navy">{nodeById(revealedEdges[revealedEdges.length - 1].from).label} → {nodeById(revealedEdges[revealedEdges.length - 1].to).label}</p>
              <p className="mt-1 text-xs leading-5 text-body">{revealedEdges[revealedEdges.length - 1].action}</p>
              <p className="mt-2 font-mono text-[9px] font-bold text-coral-700">{revealedEdges[revealedEdges.length - 1].technique}</p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {techniques.length > 0 ? techniques.map((technique) => (
              <span key={technique} className="rounded-full border border-coral-200 bg-coral-50 px-2 py-1 font-mono text-[8px] font-bold text-coral-700">{technique}</span>
            )) : <span className="text-[9px] text-muted">No ATT&amp;CK-style technique revealed yet.</span>}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Controls that break the route</p>
          {path.length === 0 ? (
            <p className="mt-2 text-xs leading-5 text-emerald-900">No data-reaching path is enabled. Keep the current controls, test their enforcement and monitor policy drift.</p>
          ) : (
            <ol className="mt-2 space-y-2">
              {path.map((edge, index) => (
                <li key={edge.id} className={`rounded-lg border bg-white p-2 text-[10px] leading-4 ${index < revealedCount ? "border-coral-200" : "border-line"}`}>
                  <p className="font-bold text-navy">{index + 1}. {nodeById(edge.from).label} → {nodeById(edge.to).label}</p>
                  <p className="mt-1 text-body">{edge.mitigation}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {blockedEdges.length > 0 ? (
        <details className="mt-4 rounded-xl border border-line bg-white p-3">
          <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.08em] text-navy">Blocked edges and their compensating controls ({blockedEdges.length})</summary>
          <div className="mt-2 overflow-x-auto" role="region" aria-label="Scrollable data table" tabIndex={0}>
            <table className="w-full min-w-[620px] text-left text-[10px]">
              <thead className="text-muted"><tr><th className="py-1.5 pr-3">Edge</th><th className="py-1.5 pr-3">Missing condition</th><th className="py-1.5">Control to retain</th></tr></thead>
              <tbody>
                {blockedEdges.map((edge) => (
                  <tr key={edge.id} className="border-t border-line align-top">
                    <td className="py-2 pr-3 font-mono text-navy">{nodeById(edge.from).label} → {nodeById(edge.to).label}</td>
                    <td className="py-2 pr-3 text-coral-700">{edge.requires.filter((key) => !flags[key]).map((key) => WEAKNESSES.find((weakness) => weakness.key === key)!.label).join(", ")}</td>
                    <td className="py-2 text-body">{edge.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </VisualizerShell>
  );
}
