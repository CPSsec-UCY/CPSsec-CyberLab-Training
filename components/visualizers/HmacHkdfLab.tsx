"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Metric, StepButton, VisualizerShell } from "./VisualizerShell";

const TOY_BLOCK_SIZE = 4;
const IPAD = 0x36;
const OPAD = 0x5c;
const DEFAULT_KEY = "key";
const DEFAULT_MESSAGE = "transfer=10";
const DEFAULT_INFO = "lab/v1/session";

const SECTIONS = [
  {
    title: "HMAC",
    detail: "The toy block is four bytes. A short key is zero-padded, then XORed with ipad and opad before the two nested hash calls.",
  },
  {
    title: "HKDF",
    detail: "Extract turns fixed illustrative input keying material into a PRK. Expand binds that PRK to two different info labels and counters.",
  },
  {
    title: "Verify",
    detail: "Move the mismatch position and switch comparison modes. Early exit performs work that depends on the matching prefix; full compare always reads every byte.",
  },
];

function encode(value: string): number[] {
  return Array.from(new TextEncoder().encode(value));
}

function toHex(bytes: readonly number[]): string {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}

function toyHash(bytes: readonly number[], seed = 0x811c9dc5): number[] {
  let state = seed >>> 0;
  for (const byte of bytes) {
    state ^= byte;
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  state ^= bytes.length;
  state = Math.imul(state, 0x01000193) >>> 0;
  return [(state >>> 24) & 0xff, (state >>> 16) & 0xff, (state >>> 8) & 0xff, state & 0xff];
}

function normaliseToyKey(key: readonly number[]): number[] {
  if (key.length > TOY_BLOCK_SIZE) return toyHash(key);
  return [...key, ...Array.from({ length: TOY_BLOCK_SIZE - key.length }, () => 0)];
}

function buildToyHmac(key: readonly number[], message: readonly number[]) {
  const normalisedKey = normaliseToyKey(key);
  const innerPad = normalisedKey.map((byte) => byte ^ IPAD);
  const outerPad = normalisedKey.map((byte) => byte ^ OPAD);
  const innerHash = toyHash([...innerPad, ...message]);
  const tag = toyHash([...outerPad, ...innerHash]);
  return { normalisedKey, innerPad, outerPad, innerHash, tag };
}

function expandToyBlock(prk: readonly number[], info: readonly number[], counter: number): number[] {
  return buildToyHmac(prk, [...info, counter]).tag;
}

function constantCompare(left: readonly number[], right: readonly number[]): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

function candidateTag(expected: readonly number[], matchingPrefix: number): number[] {
  return expected.map((byte, index) => {
    if (index < matchingPrefix) return byte;
    if (index === matchingPrefix) return byte ^ 0xff;
    return (byte + 0x11) & 0xff;
  });
}

function ByteCells({ bytes, tone = "brand" }: { bytes: readonly number[]; tone?: "brand" | "teal" | "coral" | "gold" }) {
  const tones = {
    brand: "border-brand-100 bg-brand-50 text-brand-700",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    coral: "border-coral-100 bg-coral-50 text-coral-600",
    gold: "border-gold-100 bg-gold-50 text-gold-600",
  };
  return (
    <div className="flex flex-wrap gap-1" aria-label={toHex(bytes)}>
      {bytes.map((byte, index) => (
        <span key={`${index}-${byte}`} className={`rounded border px-1.5 py-1 font-mono text-[10px] ${tones[tone]}`}>
          {byte.toString(16).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}

function ByteGroup({ label, bytes, tone }: { label: string; bytes: readonly number[]; tone?: "brand" | "teal" | "coral" | "gold" }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-white p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">{label}</p>
      <div className="mt-2">
        <ByteCells bytes={bytes} tone={tone} />
      </div>
    </div>
  );
}

export function HmacHkdfLab() {
  const [keyText, setKeyText] = useState(DEFAULT_KEY);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [constantTime, setConstantTime] = useState(true);
  const [matchingPrefix, setMatchingPrefix] = useState(2);
  const [section, setSection] = useState(0);

  const keyBytes = encode(keyText);
  const messageBytes = encode(message);
  const hmac = buildToyHmac(keyBytes, messageBytes);
  const keyWasHashed = keyBytes.length > TOY_BLOCK_SIZE;
  const salt = encode("course-salt");
  const inputKeyMaterial = encode("input-key-material");
  const prk = buildToyHmac(salt, inputKeyMaterial).tag;
  const encryptionInfo = encode(JSON.stringify({ context: info, label: "client-encrypt", version: 1 }));
  const macInfo = encode(JSON.stringify({ context: info, label: "server-mac", version: 1 }));
  const encryptionKey = expandToyBlock(prk, encryptionInfo, 1);
  const macKey = expandToyBlock(prk, macInfo, 1);
  const receivedTag = candidateTag(hmac.tag, matchingPrefix);
  const earlyExitComparisons = matchingPrefix === hmac.tag.length ? hmac.tag.length : matchingPrefix + 1;
  const comparisons = constantTime ? hmac.tag.length : earlyExitComparisons;
  const valid = constantCompare(hmac.tag, receivedTag);
  const current = SECTIONS[section];

  function reset() {
    setKeyText(DEFAULT_KEY);
    setMessage(DEFAULT_MESSAGE);
    setInfo(DEFAULT_INFO);
    setConstantTime(true);
    setMatchingPrefix(2);
    setSection(0);
  }

  return (
    <VisualizerShell
      title="HMAC / HKDF workbench"
      description="Inspect pad XORs, nested toy hashes, context-separated key derivation and comparison work."
      onReset={reset}
      controls={
        <>
          <div className="flex overflow-hidden rounded-lg border border-line bg-white" role="group" aria-label="Verification comparison mode">
            <button
              type="button"
              aria-pressed={constantTime}
              onClick={() => setConstantTime(true)}
              className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${constantTime ? "bg-teal-50 text-teal-700" : "text-muted hover:bg-mist-50 hover:text-navy"}`}
            >
              constant-time
            </button>
            <button
              type="button"
              aria-pressed={!constantTime}
              onClick={() => setConstantTime(false)}
              className={`px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] transition ${!constantTime ? "bg-coral-50 text-coral-600" : "text-muted hover:bg-mist-50 hover:text-navy"}`}
            >
              early exit
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSection((value) => Math.min(value + 1, SECTIONS.length - 1))}
            disabled={section === SECTIONS.length - 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:border-brand-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
        </>
      }
      footer={
        <p>
          Deterministic FNV-style toy checksums only — not cryptographic hashes, HMAC or HKDF. The structure mirrors HMAC&apos;s ipad/opad nesting and HKDF Extract/Expand conceptually; use vetted libraries for real cryptography. Comparison counts are simulated, not timing measurements.
        </p>
      }
    >
      <div className="rounded-xl border border-gold-200 bg-gold-50 px-3 py-2 text-[10px] font-semibold leading-5 text-gold-600">
        Teaching model: 4-byte blocks and non-cryptographic checksums. Real HMAC-SHA-256 uses 64-byte blocks and SHA-256.
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Key text</span>
          <input
            type="text"
            value={keyText}
            maxLength={16}
            onChange={(event) => setKeyText(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white"
            placeholder="toy key"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Message text</span>
          <input
            type="text"
            value={message}
            maxLength={24}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white"
            placeholder="message to authenticate"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">HKDF context / info</span>
          <input
            type="text"
            value={info}
            maxLength={32}
            onChange={(event) => setInfo(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white"
            placeholder="protocol/version/session"
          />
        </label>
      </div>

      <section className={`mt-4 rounded-xl border p-4 transition motion-safe:duration-300 motion-reduce:transition-none ${section === 0 ? "border-brand-300 bg-brand-50/40" : "border-line bg-mist-50"}`} aria-labelledby="hmac-pipeline-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 id="hmac-pipeline-title" className="text-xs font-bold text-navy">HMAC: byte-level pads and nested hashes</h4>
          <span className="rounded-md border border-line bg-white px-2 py-1 font-mono text-[9px] text-muted">toy H · 4-byte output</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <ByteGroup label="key bytes (zero-padded)" bytes={hmac.normalisedKey} />
          <ByteGroup label="K XOR ipad (0x36)" bytes={hmac.innerPad} tone="brand" />
          <ByteGroup label="K XOR opad (0x5c)" bytes={hmac.outerPad} tone="coral" />
        </div>
        <p className="mt-2 text-[10px] leading-4 text-muted">
          {keyWasHashed ? "This key exceeds the toy block size, so the toy normalises it with a checksum first." : "The short key is zero-padded to the four-byte toy block before the XORs."}
        </p>

        <div className="mt-4 space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-xl border border-line bg-white p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">inner input</p>
              <p className="mt-2 break-all font-mono text-[10px] text-body">[{toHex(hmac.innerPad)}] ‖ [{toHex(messageBytes) || "empty"}]</p>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-300 sm:rotate-0" aria-hidden="true" />
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700">inner = toy H(inner input)</p>
              <p className="mt-2 font-mono text-[11px] text-navy">{toHex(hmac.innerHash)}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-xl border border-line bg-white p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">outer input</p>
              <p className="mt-2 break-all font-mono text-[10px] text-body">[{toHex(hmac.outerPad)}] ‖ [{toHex(hmac.innerHash)}]</p>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-brand-300 sm:rotate-0" aria-hidden="true" />
            <div className="rounded-xl border border-coral-200 bg-coral-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-coral-600">tag = toy H(outer input)</p>
              <p className="mt-2 break-all font-mono text-[11px] font-bold text-navy">{toHex(hmac.tag)}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Tag changes with" value="key or message" tone="brand" />
          <Metric label="Current toy tag" value={toHex(hmac.tag)} tone="coral" />
        </div>
      </section>

      <section className={`mt-4 rounded-xl border p-4 transition motion-safe:duration-300 motion-reduce:transition-none ${section === 1 ? "border-brand-300 bg-brand-50/40" : "border-line bg-mist-50"}`} aria-labelledby="hkdf-pipeline-title">
        <h4 id="hkdf-pipeline-title" className="text-xs font-bold text-navy">HKDF: Extract → PRK → Expand → purpose-specific keys</h4>
        <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
          <div className="rounded-xl border border-gold-200 bg-gold-50 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-gold-600">Extract</p>
            <p className="mt-2 font-mono text-[10px] text-body">PRK = HMAC(salt, IKM)</p>
            <p className="mt-1 break-all font-mono text-[9px] text-muted">salt: {toHex(salt)}</p>
            <p className="break-all font-mono text-[9px] text-muted">IKM: {toHex(inputKeyMaterial)}</p>
          </div>
          <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-300 lg:block" aria-hidden="true" />
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700">PRK</p>
            <p className="mt-2 font-mono text-[11px] text-navy">{toHex(prk)}</p>
          </div>
          <ArrowRight className="mx-auto hidden h-4 w-4 text-brand-300 lg:block" aria-hidden="true" />
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-teal-700">Expand</p>
            <p className="mt-2 font-mono text-[10px] text-body">HMAC(PRK, info ‖ counter)</p>
            <p className="mt-1 text-[9px] leading-4 text-muted">context + label + version + counter</p>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-teal-700">info: {info || "(empty)"} / client-encrypt / 01</p>
            <p className="mt-2 break-all font-mono text-[9px] leading-4 text-muted">{toHex(encryptionInfo)}</p>
            <p className="mt-2 text-[10px] font-bold text-navy">Encryption key</p>
            <p className="mt-1 font-mono text-sm font-bold text-teal-700">{toHex(encryptionKey)}</p>
          </div>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-coral-600">info: {info || "(empty)"} / server-mac / 01</p>
            <p className="mt-2 break-all font-mono text-[9px] leading-4 text-muted">{toHex(macInfo)}</p>
            <p className="mt-2 text-[10px] font-bold text-navy">MAC key</p>
            <p className="mt-1 font-mono text-sm font-bold text-coral-600">{toHex(macKey)}</p>
          </div>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-body">
          Different labels produce different toy keys from the same PRK. Editing the context changes both; this is domain separation, not extra entropy.
        </p>
      </section>

      <section className={`mt-4 rounded-xl border p-4 transition motion-safe:duration-300 motion-reduce:transition-none ${section === 2 ? "border-brand-300 bg-brand-50/40" : "border-line bg-mist-50"}`} aria-labelledby="verification-title">
        <h4 id="verification-title" className="text-xs font-bold text-navy">Verify the received tag</h4>
        <label className="mt-3 block">
          <span className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
            Matching bytes before mismatch
            <span className="font-mono text-brand-700">{matchingPrefix} / {hmac.tag.length}</span>
          </span>
          <input
            type="range"
            min={0}
            max={hmac.tag.length}
            step={1}
            value={matchingPrefix}
            onChange={(event) => setMatchingPrefix(Number(event.target.value))}
            className="mt-3 w-full accent-brand-600"
            aria-valuetext={`${matchingPrefix} matching bytes${matchingPrefix === hmac.tag.length ? ", tag accepted" : ", then one mismatching byte"}`}
          />
        </label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ByteGroup label="expected tag" bytes={hmac.tag} tone="teal" />
          <ByteGroup label="received tag" bytes={receivedTag} tone={valid ? "teal" : "coral"} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Metric label="Verification" value={valid ? "valid" : "invalid"} tone={valid ? "teal" : "coral"} />
          <Metric label="Bytes compared" value={`${comparisons}/${hmac.tag.length}`} tone={constantTime ? "teal" : "coral"} />
          <Metric label="Timing signal" value={constantTime ? "fixed" : "prefix leak"} tone={constantTime ? "teal" : "coral"} />
        </div>
        <div className={`mt-3 rounded-xl border p-3 ${constantTime ? "border-teal-200 bg-teal-50" : "border-coral-200 bg-coral-50"}`} role="status">
          <p className={`text-[11px] font-bold ${constantTime ? "text-teal-700" : "text-coral-700"}`}>
            {constantTime ? "Full compare: all four bytes are processed" : `Early exit: stopped after ${comparisons} byte${comparisons === 1 ? "" : "s"}`}
          </p>
          <p className="mt-1 text-[11px] leading-5 text-body">
            {constantTime
              ? "The work is independent of where the first mismatch occurs, so the matching prefix is not exposed by comparison time."
              : "Stopping at the first mismatch makes response time depend on the matching prefix. Repeated probes can help an attacker learn the expected tag."}
          </p>
        </div>
      </section>

      <nav className="mt-3 flex flex-wrap gap-2" aria-label="HMAC and HKDF sections">
        {SECTIONS.map((item, index) => (
          <StepButton key={item.title} active={section === index} done={index < section} onClick={() => setSection(index)}>
            {item.title}
          </StepButton>
        ))}
      </nav>

      <div className="mt-3 rounded-xl border border-line bg-white p-3" aria-live="polite">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">Focus: {current.title}</p>
        <p className="mt-1 text-[11px] leading-5 text-body">{current.detail}</p>
      </div>
    </VisualizerShell>
  );
}
