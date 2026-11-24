"use client";

import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  GitBranch,
  GitPullRequest,
  Hammer,
  PenLine,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type RiskKey = "dependency" | "ciStep" | "missingSbom" | "unsigned" | "provenanceMismatch" | "stolenIdentity";
type ScenarioState = Record<RiskKey, boolean>;
type AssessmentTone = "clear" | "detected" | "undetected" | "missing";

interface StageMeta {
  name: string;
  short: string;
  input: string;
  output: string;
  boundary: string;
  icon: LucideIcon;
}

interface RiskMeta {
  key: RiskKey;
  label: string;
  description: string;
  introduced: string;
  detection: string;
  policy: string;
}

interface Assessment {
  tone: AssessmentTone;
  label: string;
  detail: string;
}

const BASE_DIGEST = "sha256:4f08c6d15b9e47a2c830e61d75a4fb923c178de506b34a29cc7f065e8d1a6b9c";
const DEPENDENCY_DIGEST = "sha256:91a37c4e8b026df514ac9e7d6f382b50c7d1e49a260bf835e9c46d7a08b15f2e";
const CI_DIGEST = "sha256:b62d140f93ea78c52d6f84a1e097cb356af28d4019c7e6b34a05d9f7c821e6a";
const COMBINED_DIGEST = "sha256:e70b4d28c613fa95d42e87b601cf9a3548d6e2b1970c4f53a8e6b2d9017c4f35";
const SOURCE_COMMIT = "9f2c1ab7d4e0a63c8b52e1f60d97a4c812e5b3f";
const EXPECTED_SIGNER = "spiffe://ci.example.invalid/release";
const STOLEN_SIGNER = "spiffe://ci.example.invalid/dev-token";

const EMPTY_SCENARIO: ScenarioState = {
  dependency: false,
  ciStep: false,
  missingSbom: false,
  unsigned: false,
  provenanceMismatch: false,
  stolenIdentity: false,
};

const STAGES: StageMeta[] = [
  {
    name: "Source",
    short: "Commit",
    input: "acme/ledger",
    output: SOURCE_COMMIT,
    boundary: "repository trust",
    icon: GitBranch,
  },
  {
    name: "Pull request",
    short: "Review",
    input: SOURCE_COMMIT,
    output: "approved release ref",
    boundary: "review trust",
    icon: GitPullRequest,
  },
  {
    name: "CI",
    short: "Execute",
    input: "pinned release workflow",
    output: "run b-2048",
    boundary: "execution trust",
    icon: Workflow,
  },
  {
    name: "Build",
    short: "Compile",
    input: "lockfile + toolchain",
    output: "container image",
    boundary: "artifact trust",
    icon: Hammer,
  },
  {
    name: "SBOM",
    short: "Inventory",
    input: "image digest",
    output: "component inventory",
    boundary: "inventory trust",
    icon: ClipboardList,
  },
  {
    name: "Sign",
    short: "Authenticate",
    input: "image digest",
    output: "Sigstore bundle",
    boundary: "signing trust",
    icon: PenLine,
  },
  {
    name: "Provenance",
    short: "Attest",
    input: "build record",
    output: "SLSA statement",
    boundary: "attestation trust",
    icon: FileCheck2,
  },
  {
    name: "Deploy",
    short: "Enforce",
    input: "digest + evidence",
    output: "allow or deny",
    boundary: "policy trust",
    icon: Rocket,
  },
];

const RISKS: RiskMeta[] = [
  {
    key: "dependency",
    label: "Compromised dependency",
    description: "payments-parser 4.8.1 contains the toy secret-exfiltration payload TOY-VULN-01.",
    introduced: "Source / lockfile",
    detection: "SBOM vulnerability scan",
    policy: "A critical toy vulnerability in a runtime dependency fails the release threshold.",
  },
  {
    key: "ciStep",
    label: "Malicious CI step",
    description: "A compromised reusable action injects an undeclared binary and sends build data to an unexpected endpoint.",
    introduced: "CI execution",
    detection: "CI egress monitoring, after execution",
    policy: "Unapproved CI behavior and undeclared build output fail the build-integrity policy.",
  },
  {
    key: "missingSbom",
    label: "Missing SBOM",
    description: "The release has no subject-bound SPDX or CycloneDX inventory for the exact image digest.",
    introduced: "SBOM generation",
    detection: "Deployment preflight",
    policy: "A missing SBOM prevents the required vulnerability and license evaluation.",
  },
  {
    key: "unsigned",
    label: "Unsigned artifact",
    description: "No signature covers the exact registry digest; provenance may still exist.",
    introduced: "Signing",
    detection: "Signature verification at deploy",
    policy: "An artifact without an accepted signature cannot be promoted to production.",
  },
  {
    key: "provenanceMismatch",
    label: "Provenance mismatch",
    description: "The provenance statement names the clean digest while the registry serves a different image digest.",
    introduced: "Provenance generation",
    detection: "Subject and material predicates",
    policy: "Provenance must name the deployed digest and the approved source, builder and materials.",
  },
  {
    key: "stolenIdentity",
    label: "Stolen signing identity",
    description: "A stolen developer token signs the image correctly, but the signer is not the approved release workload.",
    introduced: "Signing",
    detection: "Deployment identity policy; cryptographic verification passes",
    policy: "A mathematically valid signature from an unexpected identity is not authorised.",
  },
];

const ASSESSMENT_STYLES: Record<AssessmentTone, string> = {
  clear: "border-emerald-200 bg-emerald-50 text-emerald-700",
  detected: "border-rose-200 bg-rose-50 text-rose-700",
  undetected: "border-gold-200 bg-gold-50 text-gold-700",
  missing: "border-coral-200 bg-coral-50 text-coral-700",
};

function artifactDigest(scenario: ScenarioState) {
  if (scenario.dependency && scenario.ciStep) return COMBINED_DIGEST;
  if (scenario.dependency) return DEPENDENCY_DIGEST;
  if (scenario.ciStep) return CI_DIGEST;
  return BASE_DIGEST;
}

function signatureState(scenario: ScenarioState) {
  if (scenario.unsigned) return { value: "Missing", detail: "No signature covers the registry digest.", tone: "rose" as const };
  if (scenario.stolenIdentity) return { value: "Valid", detail: `Cryptographically valid signature from ${STOLEN_SIGNER}.`, tone: "gold" as const };
  return { value: "Valid", detail: `Signature covers the exact digest and verifies against ${EXPECTED_SIGNER}.`, tone: "teal" as const };
}

function signerState(scenario: ScenarioState) {
  if (scenario.unsigned) return { value: "None", detail: "No signer certificate is present.", tone: "rose" as const };
  if (scenario.stolenIdentity) return { value: "Wrong ID", detail: "The certificate identity is outside the release-workload allowlist.", tone: "coral" as const };
  return { value: "Expected", detail: "The certificate identity matches the approved release workload.", tone: "teal" as const };
}

function sbomState(scenario: ScenarioState) {
  if (scenario.missingSbom) return { value: "N/A", detail: "No SBOM is attached to this artifact digest.", tone: "rose" as const };
  if (scenario.dependency) return { value: "1 toy", detail: "37 components; TOY-VULN-01 affects payments-parser 4.8.1.", tone: "coral" as const };
  if (scenario.ciStep) return { value: "Unknown", detail: "37 declared components; the injected binary is omitted from the inventory.", tone: "gold" as const };
  return { value: "0 known", detail: "37 components and no matches in the toy vulnerability fixture.", tone: "teal" as const };
}

function provenanceState(scenario: ScenarioState) {
  if (scenario.provenanceMismatch) {
    return { value: "Mismatch", detail: `Statement subject ${BASE_DIGEST} does not equal the registry digest.`, tone: "coral" as const };
  }
  return { value: "Match", detail: "Statement subject, source commit, builder and declared materials match policy expectations.", tone: "teal" as const };
}

function slsaState(scenario: ScenarioState) {
  if (scenario.provenanceMismatch || scenario.stolenIdentity) {
    return { value: "L1", detail: "Only provenance existence is supportable; expected build identity or subject linkage is not established.", tone: "coral" as const };
  }
  if (scenario.ciStep) {
    return { value: "L2", detail: "Hosted, signed provenance exists, but the simulated user-defined step bypasses Build L3 isolation.", tone: "gold" as const };
  }
  return { value: "L3", detail: "The toy hosted builder is ephemeral and isolated, and signs provenance outside user-defined steps.", tone: "teal" as const };
}

function stageAssessment(index: number, scenario: ScenarioState): Assessment {
  if (index === 0) {
    if (scenario.dependency || scenario.ciStep) {
      return {
        tone: "undetected",
        label: "Undetected",
        detail: "A package update and workflow change enter version control. Repository history preserves what changed, but cannot establish that upstream content or future runtime behavior is benign.",
      };
    }
    return { tone: "clear", label: "Clear", detail: "The commit is protected by branch rules and contains the approved dependency and workflow state." };
  }

  if (index === 1) {
    if (scenario.dependency || scenario.ciStep) {
      return {
        tone: "undetected",
        label: "Undetected",
        detail: "Review sees package coordinates and pinned workflow references. It approves the change without evidence about upstream compromise or runtime side effects.",
      };
    }
    return { tone: "clear", label: "Clear", detail: "Required reviewers approve the source diff and the release ref is protected from direct pushes." };
  }

  if (index === 2) {
    if (scenario.ciStep) {
      return {
        tone: "detected",
        label: "Detected late",
        detail: "An egress alert reports unexpected traffic after the compromised action executes. Detection is useful, but it arrives too late to protect this build's output.",
      };
    }
    if (scenario.stolenIdentity) {
      return {
        tone: "undetected",
        label: "Undetected",
        detail: "The stolen token has a valid audience and the signing service has not yet observed an identity-policy violation.",
      };
    }
    if (scenario.dependency) {
      return {
        tone: "undetected",
        label: "Undetected",
        detail: "Dependency installation and package lifecycle hooks execute before content scanning. Lockfile integrity only proves which bytes were selected.",
      };
    }
    return { tone: "clear", label: "Clear", detail: "The workflow runs in an ephemeral job with no persistent credentials and no unexpected egress." };
  }

  if (index === 3) {
    if (scenario.dependency || scenario.ciStep) {
      return {
        tone: "undetected",
        label: "Undetected",
        detail: "The build completes and produces a deterministic but unexpected digest. No independent clean-build comparison runs at this boundary.",
      };
    }
    return { tone: "clear", label: "Clear", detail: "Compilation produces the expected fixture digest from approved source, toolchain and locked dependencies." };
  }

  if (index === 4) {
    if (scenario.missingSbom) {
      return { tone: "missing", label: "Missing", detail: "No inventory is emitted, so the downstream policy cannot evaluate components, licenses or vulnerabilities for this digest." };
    }
    if (scenario.dependency) {
      return { tone: "detected", label: "Detected", detail: "The scanner reports the toy critical vulnerability TOY-VULN-01 in payments-parser 4.8.1. Release policy must still enforce the finding." };
    }
    if (scenario.ciStep) {
      return { tone: "undetected", label: "Undetected", detail: "The BOM lists declared packages but omits the binary injected by the compromised CI step. Inventory completeness is a separate claim from package vulnerability matching." };
    }
    return { tone: "clear", label: "Clear", detail: "A subject-bound SPDX/CycloneDX BOM lists 37 components and matches the toy vulnerability fixture with no findings." };
  }

  if (index === 5) {
    if (scenario.unsigned) {
      return { tone: "missing", label: "Missing", detail: "Verification finds no signature for the exact artifact digest. A tag or registry account name is not a substitute." };
    }
    if (scenario.stolenIdentity) {
      return { tone: "undetected", label: "Undetected cryptographically", detail: "The signature verifies because the stolen key is real. This stage checks mathematics, not whether the signer was authorised for this release." };
    }
    return { tone: "clear", label: "Clear", detail: "The approved release workload signs the exact digest and records a verifiable bundle." };
  }

  if (index === 6) {
    if (scenario.provenanceMismatch) {
      return { tone: "detected", label: "Detected", detail: "The statement subject differs from the registry artifact digest. Signature verification cannot repair a false subject-to-artifact link." };
    }
    if (scenario.ciStep) {
      return { tone: "undetected", label: "Undetected", detail: "Provenance records declared inputs but cannot prove the compromised step had no undeclared side effects." };
    }
    return { tone: "clear", label: "Clear", detail: "The statement binds the actual digest to the approved commit, build parameters and locked dependency materials." };
  }

  const activeCount = RISKS.filter((risk) => scenario[risk.key]).length;
  if (activeCount === 0) {
    return { tone: "clear", label: "Deploy", detail: "All required predicates pass: expected signer, matching provenance, complete SBOM, acceptable vulnerability result and approved build behavior." };
  }
  return {
    tone: "detected",
    label: "Block",
    detail: `${activeCount} active scenario control${activeCount === 1 ? "" : "s"} violate deployment policy. The admission decision is fail-closed and records every failed predicate.`,
  };
}

function stageEvidence(index: number, scenario: ScenarioState, digest: string): Array<[string, string]> {
  if (index === 0) return [["Repository", "acme/ledger"], ["Commit", SOURCE_COMMIT], ["Dependency", scenario.dependency ? "payments-parser 4.8.1" : "payments-parser 4.8.0"]];
  if (index === 1) return [["Base ref", "refs/heads/main"], ["Approval", "2 reviewers"], ["Workflow actions", "digest-pinned"]];
  if (index === 2) return [["Run", "b-2048"], ["Identity", "ephemeral OIDC"], ["Network", scenario.ciStep ? "unexpected egress observed" : "expected endpoints only"]];
  if (index === 3) return [["Artifact", "registry.example.invalid/ledger-api"], ["Digest", digest], ["Inputs", scenario.dependency || scenario.ciStep ? "differ from clean fixture" : "match clean fixture"]];
  if (index === 4) return [["Format", "SPDX / CycloneDX"], ["Components", scenario.missingSbom ? "unavailable" : "37"], ["Vulnerability", scenario.missingSbom ? "unevaluated" : scenario.dependency ? "TOY-VULN-01" : scenario.ciStep ? "inventory gap" : "none in fixture"]];
  if (index === 5) return [["Signer", scenario.unsigned ? "none" : scenario.stolenIdentity ? STOLEN_SIGNER : EXPECTED_SIGNER], ["Signature", signatureState(scenario).value], ["Subject", digest]];
  if (index === 6) return [["Builder", "hosted-builder/release"], ["Source", SOURCE_COMMIT], ["Subject", scenario.provenanceMismatch ? BASE_DIGEST : digest]];
  return [["Requested digest", digest], ["Required evidence", "signature + SBOM + provenance"], ["Decision", RISKS.some((risk) => scenario[risk.key]) ? "DENY" : "ALLOW"]];
}

export function SupplyChainLab() {
  const [scenario, setScenario] = useState<ScenarioState>(EMPTY_SCENARIO);
  const [stageIndex, setStageIndex] = useState(0);

  const digest = artifactDigest(scenario);
  const signature = signatureState(scenario);
  const signer = signerState(scenario);
  const sbom = sbomState(scenario);
  const provenance = provenanceState(scenario);
  const slsa = slsaState(scenario);
  const activeRisks = RISKS.filter((risk) => scenario[risk.key]);
  const blocked = activeRisks.length > 0;
  const assessment = stageAssessment(stageIndex, scenario);
  const evidence = stageEvidence(stageIndex, scenario, digest);
  const ActiveIcon = STAGES[stageIndex].icon;

  function toggleRisk(key: RiskKey) {
    setScenario((current) => ({ ...current, [key]: !current[key] }));
  }

  function reset() {
    setScenario(EMPTY_SCENARIO);
    setStageIndex(0);
  }

  return (
    <VisualizerShell
      title="Trace a release, then attack its evidence"
      description="Eight deterministic stages, six independent faults and one fail-closed production policy."
      onReset={reset}
      controls={
        <button
          type="button"
          onClick={() => setStageIndex((value) => Math.min(value + 1, STAGES.length - 1))}
          disabled={stageIndex === STAGES.length - 1}
          className="btn-primary px-3 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {stageIndex === STAGES.length - 1 ? "Pipeline complete" : "Next stage"}
          {stageIndex < STAGES.length - 1 ? <ArrowRight className="h-3 w-3" /> : null}
        </button>
      }
      footer={
        <span>
          <strong className="text-navy">Toy model:</strong> all identities, digests and vulnerability IDs are fictional. The SLSA metric is the highest v1.1 Build level supported by the simulated evidence, not a software-safety score. Vulnerabilities, missing evidence and an unsigned artifact can block deployment without lowering the build-platform level. Detection is shown separately from enforcement.
        </span>
      }
    >
      <div className="rounded-xl border border-line bg-mist-50 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Deterministic release fixture</p>
            <p className="mt-1 text-xs font-bold text-navy">ledger-api:2.4.0 · run b-2048</p>
          </div>
          <div className="max-w-full text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">Registry digest</p>
            <p className="mt-1 break-all font-mono text-[9px] text-body">{digest}</p>
          </div>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Introduce one or more faults</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RISKS.map((risk) => (
            <label
              key={risk.key}
              className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 transition ${
                scenario[risk.key] ? "border-coral-300 bg-coral-50" : "border-line bg-white hover:border-brand-200"
              }`}
            >
              <input
                type="checkbox"
                checked={scenario[risk.key]}
                onChange={() => toggleRisk(risk.key)}
                className="mt-0.5 accent-coral-600"
              />
              <span>
                <span className={`block text-[10px] font-bold ${scenario[risk.key] ? "text-coral-800" : "text-navy"}`}>{risk.label}</span>
                <span className="mt-1 block text-[9px] leading-4 text-muted">{risk.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Source-to-deploy pipeline</p>
          <p className="font-mono text-[9px] text-brand-700">stage {stageIndex + 1} / {STAGES.length}</p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Pipeline stages">
          {STAGES.map((stage, index) => {
            const stageView = stageAssessment(index, scenario);
            return (
              <StepButton key={stage.name} active={stageIndex === index} done={index < stageIndex} onClick={() => setStageIndex(index)}>
                <span className="flex w-full flex-col items-start gap-1.5">
                  <span className="flex w-full items-center justify-between gap-2">
                    <span>{String(index + 1).padStart(2, "0")} {stage.name}</span>
                    <span className={`h-2 w-2 rounded-full ${stageView.tone === "clear" ? "bg-emerald-500" : stageView.tone === "detected" ? "bg-rose-500" : "bg-gold-500"}`} />
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[7px] ${ASSESSMENT_STYLES[stageView.tone]}`}>{stageView.label}</span>
                </span>
              </StepButton>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <Metric label="SLSA build" value={slsa.value} tone={slsa.tone} />
        <Metric label="Signature" value={signature.value} tone={signature.tone} />
        <Metric label="Signer" value={signer.value} tone={signer.tone} />
        <Metric label="SBOM vulnerability" value={sbom.value} tone={sbom.tone} />
        <Metric label="Provenance" value={provenance.value} tone={provenance.tone} />
        <Metric label="Deploy gate" value={blocked ? "BLOCK" : "DEPLOY"} tone={blocked ? "rose" : "teal"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]" aria-live="polite">
        <div className="rounded-xl border border-line bg-white p-3">
          <div className="flex items-center gap-2">
            <ActiveIcon className="h-4 w-4 text-brand-600" />
            <div>
              <p className="text-[10px] font-bold text-navy">{STAGES[stageIndex].name} · {STAGES[stageIndex].short}</p>
              <p className="text-[8px] uppercase tracking-[0.1em] text-muted">{STAGES[stageIndex].boundary}</p>
            </div>
          </div>
          <p className="mt-3 text-[9px] text-muted"><strong className="text-body">Input:</strong> {STAGES[stageIndex].input}</p>
          <p className="mt-1 text-[9px] text-muted"><strong className="text-body">Output:</strong> {STAGES[stageIndex].output}</p>
          <dl className="mt-3 space-y-2 border-t border-line pt-3">
            {evidence.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[92px_1fr] gap-2 text-[9px] leading-4">
                <dt className="font-bold uppercase tracking-[0.06em] text-muted">{label}</dt>
                <dd className="break-all font-mono text-body">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={`rounded-xl border p-3 ${ASSESSMENT_STYLES[assessment.tone]}`}>
          <div className="flex items-start gap-2">
            {assessment.tone === "clear" ? <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em]">Stage assessment · {assessment.label}</p>
              <p className="mt-2 text-[11px] leading-5">{assessment.detail}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2 border-t border-current/10 pt-3">
            <p className="text-[9px] leading-4"><strong>SLSA:</strong> {slsa.detail}</p>
            <p className="text-[9px] leading-4"><strong>Signature:</strong> {signature.detail}</p>
            <p className="text-[9px] leading-4"><strong>SBOM:</strong> {sbom.detail}</p>
            <p className="text-[9px] leading-4"><strong>Provenance:</strong> {provenance.detail}</p>
          </div>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border p-3 ${blocked ? "border-rose-300 bg-rose-50" : "border-emerald-300 bg-emerald-50"}`} aria-live="polite">
        <div className="flex items-start gap-2">
          {blocked ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${blocked ? "text-rose-700" : "text-emerald-700"}`}>
              Final decision · {blocked ? "Block deployment" : "Deploy approved digest"}
            </p>
            {blocked ? (
              <ul className="mt-2 space-y-1.5">
                {activeRisks.map((risk) => (
                  <li key={risk.key} className="text-[10px] leading-4 text-rose-900"><strong>{risk.label}:</strong> {risk.policy}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[10px] leading-5 text-emerald-900">Promote the immutable digest, not the mutable tag. Record the decision, policy version and evidence references with the deployment event.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="bg-mist-50 px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Fault detection map</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[9px]">
            <caption className="sr-only">Each enabled toy fault, where it enters the pipeline, how it is detected and why deployment policy blocks it</caption>
            <thead className="border-b border-line bg-white text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">Fault</th>
                <th className="px-3 py-2 font-bold">State</th>
                <th className="px-3 py-2 font-bold">Introduced</th>
                <th className="px-3 py-2 font-bold">Detection boundary</th>
              </tr>
            </thead>
            <tbody>
              {RISKS.map((risk) => (
                <tr key={risk.key} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-semibold text-navy">{risk.label}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${scenario[risk.key] ? "border-coral-200 bg-coral-50 text-coral-700" : "border-line bg-mist-50 text-muted"}`}>
                      {scenario[risk.key] ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-body">{risk.introduced}</td>
                  <td className="px-3 py-2 text-body">{risk.detection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VisualizerShell>
  );
}
