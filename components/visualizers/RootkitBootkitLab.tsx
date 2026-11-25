"use client";

import { useState } from "react";
import { ArrowRight, Cpu, Eye, Layers3, ShieldCheck, Wrench } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

type LayerKey = "user" | "kernel" | "bootloader" | "uefi";

interface Visibility {
  vantage: string;
  observation: string;
  limitation: string;
}

interface InfectionLayer {
  key: LayerKey;
  label: string;
  stageIndex: number;
  point: string;
  persistence: string;
  conceptualMechanism: string;
  bootPolicy: string;
  secureBootEffect: string;
  visibility: Visibility[];
  detection: string;
  detectionVantage: string;
  containment: string;
  recovery: string;
}

const LAYERS: InfectionLayer[] = [
  {
    key: "user",
    label: "User-mode hook",
    stageIndex: 4,
    point: "Session service and application interface",
    persistence: "A launcher or service restores the hook when the session starts.",
    conceptualMechanism: "Results presented to one user-space component are filtered before they reach the analyst or application.",
    bootPolicy: "User-mode persistence can reload during every session without modifying firmware or the bootloader.",
    secureBootEffect: "Secure Boot does not directly police ordinary user-mode API behaviour.",
    visibility: [
      { vantage: "User mode", observation: "Inconsistent application results or service responses.", limitation: "The component supplying the view may itself be filtered." },
      { vantage: "Kernel", observation: "Process, image-load and object-access anomalies may remain visible.", limitation: "A benign-looking user process does not prove the service is trustworthy." },
      { vantage: "Firmware", observation: "No direct view of a user-mode hook.", limitation: "Firmware measurements cannot establish session integrity." },
    ],
    detection: "Cross-view disagreement: an independent kernel or external view contradicts the user-space service response.",
    detectionVantage: "Kernel or out-of-band evidence",
    containment: "Isolate the host, preserve process and service evidence, revoke exposed credentials and stop the launcher from restarting.",
    recovery: "Remove the launcher and service configuration, rotate credentials, rebuild the host from a trusted image and verify session behaviour.",
  },
  {
    key: "kernel",
    label: "Kernel callback",
    stageIndex: 3,
    point: "Kernel notification and callback path",
    persistence: "A kernel component restores the callback each time the operating system loads.",
    conceptualMechanism: "A high-privilege notification path suppresses or alters selected events before user-space consumers receive them.",
    bootPolicy: "The altered callback is a runtime state; a clean boot measurement alone does not prove the callback table is intact.",
    secureBootEffect: "Secure Boot can constrain which boot components load, but it does not directly validate every kernel callback.",
    visibility: [
      { vantage: "User mode", observation: "Missing or contradictory endpoint alerts.", limitation: "The telemetry agent may consume the altered callback." },
      { vantage: "Kernel", observation: "Unexpected callback registration or a mismatch against an independently acquired kernel view.", limitation: "Acquisition tooling may share the compromised operating-system path." },
      { vantage: "Firmware", observation: "Boot-component measurements, not live callback state.", limitation: "A measured boot can still lead to an altered kernel runtime." },
    ],
    detection: "Independent kernel-view comparison plus out-of-band process, object and network telemetry.",
    detectionVantage: "Independent kernel view and external telemetry",
    containment: "Isolate first, preserve memory and kernel evidence with an approved method, then stop the responsible component.",
    recovery: "Rebuild from trusted boot media, restore kernel policy, rotate credentials and validate that alerts and callbacks agree across independent views.",
  },
  {
    key: "bootloader",
    label: "Bootloader implant",
    stageIndex: 2,
    point: "Bootloader-to-kernel handoff",
    persistence: "The altered boot component participates again on each reboot before the operating system starts.",
    conceptualMechanism: "The handoff to the next boot stage is changed so a later component can be influenced before normal security software runs.",
    bootPolicy: "The implant sits before the operating system and may affect what the kernel and session are shown.",
    secureBootEffect: "In the toy policy, Secure Boot blocks an untrusted bootloader before the handoff. Bypassing trust would require a separate assumption.",
    visibility: [
      { vantage: "User mode", observation: "Usually no direct view of the modified handoff.", limitation: "Endpoint tools start after the altered stage." },
      { vantage: "Kernel", observation: "Handoff artefacts or unexpected early-load state may be examined.", limitation: "Kernel tools cannot independently prove the pre-kernel bytes were authentic." },
      { vantage: "Firmware", observation: "Bootloader measurement and trust decision can be inspected before handoff.", limitation: "A measurement detects a mismatch only if the verifier and reference values are trustworthy." },
    ],
    detection: "Unexpected bootloader measurement, trust-policy violation or disagreement between firmware and kernel handoff views.",
    detectionVantage: "Firmware measurement and independent boot-media analysis",
    containment: "Keep the host off the production network, preserve authorised firmware and boot-media evidence and prevent repeated untrusted boots.",
    recovery: "Restore the trusted bootloader from vendor-supported media, re-enable and verify Secure Boot, re-provision keys and rebuild the operating system.",
  },
  {
    key: "uefi",
    label: "UEFI driver implant",
    stageIndex: 1,
    point: "Firmware driver dispatch",
    persistence: "The firmware invokes the driver on every boot before the normal bootloader path.",
    conceptualMechanism: "An untrusted firmware component is dispatched early and can influence later boot stages or their visibility.",
    bootPolicy: "Firmware is the earliest software trust point in this model; ordinary user-mode integrity checks arrive too late.",
    secureBootEffect: "In the toy policy, Secure Boot rejects an untrusted UEFI driver. The result changes if policy keys or verification are compromised.",
    visibility: [
      { vantage: "User mode", observation: "No direct firmware-driver inventory.", limitation: "A clean-looking session does not establish firmware integrity." },
      { vantage: "Kernel", observation: "Later handoff anomalies may be visible, but not the firmware's internal dispatch state.", limitation: "The kernel trusts the handoff it receives." },
      { vantage: "Firmware", observation: "Driver inventory, trust decision and measured code paths.", limitation: "Firmware acquisition must be supported, authorised and interpreted with the correct platform reference." },
    ],
    detection: "Firmware inventory or measurement mismatch, unexpected driver dispatch and an untrusted boot-policy decision.",
    detectionVantage: "Independent firmware acquisition and measurement",
    containment: "Remove the system from trusted networks, preserve firmware evidence where supported and stop normal boot into the affected environment.",
    recovery: "Use vendor-supported firmware reflash or platform replacement, reset provisioning keys, restore Secure Boot policy, verify measurements and rotate exposed secrets.",
  },
];

const BOOT_STAGES = [
  { title: "Reset & firmware", detail: "Platform initialisation and trust checks" },
  { title: "UEFI driver dispatch", detail: "Early firmware services and drivers" },
  { title: "Bootloader handoff", detail: "Transfer toward the operating-system loader" },
  { title: "Kernel initialisation", detail: "Kernel, drivers and security components" },
  { title: "Session services", detail: "User processes and endpoint telemetry" },
];

const PHASES = [
  "Select an infection layer",
  "Firmware trust",
  "Bootloader handoff",
  "Kernel state",
  "Session visibility",
  "Contain and recover",
];

export function RootkitBootkitLab() {
  const [layerKey, setLayerKey] = useState<LayerKey>("kernel");
  const [secureBoot, setSecureBoot] = useState(true);
  const [attestation, setAttestation] = useState(false);
  const [step, setStep] = useState(0);

  const layer = LAYERS.find((candidate) => candidate.key === layerKey)!;
  const blockedBySecureBoot = secureBoot && (layerKey === "bootloader" || layerKey === "uefi");
  const currentStageIndex = Math.max(0, Math.min(BOOT_STAGES.length - 1, step - 1));

  function selectLayer(key: LayerKey) {
    setLayerKey(key);
    setStep(0);
  }

  function reset() {
    setLayerKey("kernel");
    setSecureBoot(true);
    setAttestation(false);
    setStep(0);
  }

  function phaseNarrative() {
    if (step === 0) return "Choose a layer and advance through the boot chain. The highlighted stage marks the conceptual persistence point, not an implementation recipe.";
    if (step === 1) return blockedBySecureBoot
      ? `The firmware trust decision rejects the untrusted ${layer.label.toLowerCase()} before dispatch. The simulation stops here; an implant would need an additional trust-policy compromise to reach the next stage.`
      : "Firmware initialises the platform. Trust decisions and early measurements can provide evidence before endpoint security software is available.";
    if (step === 2) return blockedBySecureBoot
      ? "The toy boot does not continue because Secure Boot blocked the earlier component. Firmware-side evidence should confirm the expected rejection."
      : "The bootloader hands control toward the operating system. Comparing firmware and kernel views helps distinguish a clean handoff from a changed one.";
    if (step === 3) return "The kernel starts drivers and security components. A kernel-mode implant can conflict with this view, so independently acquired or out-of-band evidence matters.";
    if (step === 4) return "The session starts endpoint tools and user applications. Missing alerts are not proof of cleanliness when the component producing those alerts may be filtered.";
    return blockedBySecureBoot
      ? "Containment still confirms that the host cannot repeatedly load the rejected component. Recovery verifies policy, keys and measurements before returning the platform to service."
      : "Containment stops further trust in the platform; recovery restores trusted boot components and proves that the original path cannot return. Restarting alone is insufficient.";
  }

  return (
    <VisualizerShell
      title="Boot-chain and persistence explorer"
      description="Choose a conceptual infection layer, compare trust controls and step from firmware evidence to recovery."
      onReset={reset}
      controls={
        <>
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.08em] text-muted">Infection layer</span>
            <select
              value={layerKey}
              onChange={(event) => selectLayer(event.target.value as LayerKey)}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-body"
            >
              {LAYERS.map((candidate) => <option key={candidate.key} value={candidate.key}>{candidate.label}</option>)}
            </select>
          </label>
          <StepButton active={step > 0 && step < PHASES.length - 1} done={step === PHASES.length - 1} onClick={() => setStep((current) => Math.min(PHASES.length - 1, current + 1))}>
            {step === 0 ? "Next phase" : step === PHASES.length - 1 ? "Analysis complete" : "Next phase"}
            <ArrowRight className="ml-1 inline h-3 w-3" />
          </StepButton>
        </>
      }
      footer={
        <span>
          <strong className="text-navy">CONCEPTUAL SIMULATION:</strong> this explorer contains no rootkit, bootkit, hook, driver or firmware code and performs no platform modification. Secure Boot and attestation outcomes are simplified teaching assumptions, not guarantees about a real device.
        </span>
      }
    >
      <section className="rounded-xl border border-line bg-mist-50 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Trust controls</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-lg border p-3 ${secureBoot ? "border-emerald-200 bg-emerald-50" : "border-line bg-white"}`}>
            <span className="flex items-center gap-2 text-[10px] font-bold text-navy"><input type="checkbox" checked={secureBoot} onChange={(event) => { setSecureBoot(event.target.checked); setStep(0); }} className="accent-emerald-600" />Secure Boot enforced</span>
            <span className="mt-1 block text-[9px] leading-4 text-muted">Toy policy rejects untrusted bootloader and UEFI components.</span>
          </label>
          <label className={`cursor-pointer rounded-lg border p-3 ${attestation ? "border-brand-200 bg-brand-50" : "border-line bg-white"}`}>
            <span className="flex items-center gap-2 text-[10px] font-bold text-navy"><input type="checkbox" checked={attestation} onChange={(event) => { setAttestation(event.target.checked); setStep(0); }} className="accent-brand-600" />Remote attestation</span>
            <span className="mt-1 block text-[9px] leading-4 text-muted">A trusted verifier compares reported measurements with a reference.</span>
          </label>
        </div>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Metric label="Analysis phase" value={`${step} / ${PHASES.length - 1}`} />
        <Metric label="Boot-policy outcome" value={blockedBySecureBoot ? "Blocked" : "Loads"} tone={blockedBySecureBoot ? "teal" : "coral"} />
        <Metric label="Persistence point" value={BOOT_STAGES[layer.stageIndex].title} tone="gold" />
        <Metric label="Attestation evidence" value={attestation ? (blockedBySecureBoot ? "Expected rejection" : "Mismatch signal") : "Unavailable"} tone={attestation ? "brand" : "gold"} />
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-line">
        <div className="border-b border-line bg-mist-50 px-3 py-2">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Layers3 className="h-3.5 w-3.5 text-brand-600" /> Conceptual boot chain</p>
        </div>
        <div className="overflow-x-auto p-3">
          <div className="flex min-w-[760px] items-stretch gap-2">
            {BOOT_STAGES.map((stage, index) => {
              const infected = index === layer.stageIndex;
              const current = step > 0 && index === currentStageIndex && !blockedBySecureBoot;
              return (
                <div key={stage.title} className="flex flex-1 items-center gap-2">
                  <div className={`min-h-[112px] flex-1 rounded-xl border p-3 ${infected ? "border-coral-300 bg-coral-50" : current ? "border-brand-300 bg-brand-50" : "border-line bg-white"}`}>
                    <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted">Stage {index + 1}</p>
                    <p className="mt-1 text-[10px] font-bold text-navy">{stage.title}</p>
                    <p className="mt-2 text-[9px] leading-4 text-body">{stage.detail}</p>
                    <p className={`mt-2 text-[8px] font-bold uppercase ${infected ? "text-coral-700" : current ? "text-brand-700" : "text-muted"}`}>{infected ? "Persistence point" : current ? "Current view" : "Boot stage"}</p>
                  </div>
                  {index < BOOT_STAGES.length - 1 ? <ArrowRight className="h-4 w-4 shrink-0 text-brand-400" /> : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 border-t border-line px-3 py-2 text-[9px] font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-coral-300" /> selected persistence point</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-brand-300" /> current evidence phase</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-600" /> secure-boot stop occurs before dispatch when enabled</span>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-coral-200 bg-coral-50 p-3" aria-live="polite">
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-coral-700">{PHASES[step]}</p>
        <p className="mt-2 text-xs leading-5 text-body">{phaseNarrative()}</p>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Cpu className="h-3.5 w-3.5 text-brand-600" /> Hook and persistence point</p>
          <p className="mt-2 text-xs font-bold text-navy">{layer.point}</p>
          <p className="mt-2 text-[10px] leading-5 text-body">{layer.conceptualMechanism}</p>
          <p className="mt-3 text-[10px] leading-5 text-body"><strong className="text-navy">Reboot behaviour:</strong> {layer.persistence}</p>
          <p className="mt-3 text-[10px] leading-5 text-body"><strong className="text-navy">Trust position:</strong> {layer.bootPolicy}</p>
        </section>

        <section className={`rounded-xl border p-3 ${blockedBySecureBoot ? "border-emerald-200 bg-emerald-50" : "border-gold-200 bg-gold-50"}`}>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Control interpretation</p>
          <p className="mt-2 text-[10px] leading-5 text-body"><strong>Secure Boot:</strong> {layer.secureBootEffect}</p>
          <p className="mt-3 text-[10px] leading-5 text-body"><strong>Attestation:</strong> {attestation
            ? blockedBySecureBoot
              ? "The toy verifier reports the expected rejection and policy decision. It does not repair a compromised firmware trust store by itself."
              : "The toy verifier can report a measurement mismatch to an independent service. It provides evidence, not automatic containment or recovery."
            : "No remote measurement comparison is available. Local views remain useful, but disagreement between vantage points is harder to establish."}</p>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-white p-3 lg:col-span-2">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Eye className="h-3.5 w-3.5 text-brand-600" /> Visibility by vantage point</p>
          <div className="mt-2 overflow-x-auto" role="region" aria-label="Scrollable data table" tabIndex={0}>
            <table className="cyber-table cyber-table--dense w-full min-w-[680px] text-left text-[11px]">
              <thead className="bg-mist-50 text-muted"><tr><th scope="col" className="px-2 py-2">Vantage</th><th scope="col" className="px-2 py-2">Potential observation</th><th scope="col" className="px-2 py-2">Important limitation</th></tr></thead>
              <tbody>{layer.visibility.map((item) => (
                <tr key={item.vantage} className="border-t border-line align-top">
                  <th scope="row" className="px-2 py-2 font-bold text-navy">{item.vantage}</th><td className="px-2 py-2 leading-5 text-body">{item.observation}</td><td className="px-2 py-2 leading-5 text-muted">{item.limitation}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-brand-200 bg-brand-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Detection signal</p>
          <p className="mt-2 text-xs leading-5 text-body">{layer.detection}</p>
          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700">Required vantage · {layer.detectionVantage}</p>
          <p className="mt-2 text-[9px] leading-4 text-muted">No single clean endpoint view proves the absence of lower-layer persistence. Corroborate across trust boundaries and preserve raw measurements.</p>
        </section>

        <section className="rounded-xl border border-line bg-white p-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy"><Wrench className="h-3.5 w-3.5 text-brand-600" /> Containment and recovery</p>
          <p className="mt-2 text-[10px] leading-5 text-body"><strong className="text-navy">Contain:</strong> {layer.containment}</p>
          <p className="mt-3 text-[10px] leading-5 text-body"><strong className="text-navy">Recover:</strong> {layer.recovery}</p>
        </section>
      </div>
    </VisualizerShell>
  );
}
