"use client";

import { useMemo, useState } from "react";
import { Metric, StepButton, VisualizerShell } from "@/components/visualizers/VisualizerShell";

const Q = 257;
const CHAIN_LENGTH = 15;

function mod(value: number): number {
  return ((value % Q) + Q) % Q;
}

function toyHash(value: number, chainIndex: number): number {
  return mod(value * value + chainIndex + 1);
}

function buildChain(chainIndex: number): number[] {
  const chain = [mod(10 + chainIndex * 17)];
  for (let position = 1; position <= CHAIN_LENGTH; position += 1) {
    chain.push(toyHash(chain[position - 1], chainIndex));
  }
  return chain;
}

function advance(value: number, steps: number, chainIndex: number): number {
  let current = value;
  for (let step = 0; step < steps; step += 1) current = toyHash(current, chainIndex);
  return current;
}

export function WotsChainLab() {
  const [chainIndex, setChainIndex] = useState(0);
  const [digit, setDigit] = useState(2);
  const [phase, setPhase] = useState(0);

  const chain = useMemo(() => buildChain(chainIndex), [chainIndex]);
  const secondDigit = (digit + 5) % CHAIN_LENGTH;
  const forgePosition = Math.max(digit, secondDigit);
  const endpoint = chain[CHAIN_LENGTH];
  const firstVerified = phase >= 1 && advance(chain[digit], CHAIN_LENGTH - digit, chainIndex) === endpoint;
  const secondVerified = phase >= 2 && advance(chain[secondDigit], CHAIN_LENGTH - secondDigit, chainIndex) === endpoint;
  const forgedVerified = phase >= 2 && advance(chain[forgePosition], CHAIN_LENGTH - forgePosition, chainIndex) === endpoint;

  function reset() {
    setChainIndex(0);
    setDigit(2);
    setPhase(0);
  }

  function selectChain(value: number) {
    setChainIndex(value);
    setPhase(0);
  }

  function selectDigit(value: number) {
    setDigit(value);
    setPhase(0);
  }

  return (
    <VisualizerShell
      title="WOTS+ chain reuse, made visible"
      description="Sign one toy digest, reuse the same one-time chain for another, then combine the revealed positions into a forged chain component."
      onReset={reset}
      controls={
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            Chain index
            <select
              value={chainIndex}
              onChange={(event) => selectChain(Number(event.target.value))}
              className="mt-1 block h-8 rounded-lg border border-line bg-white px-2 font-mono text-xs text-navy"
            >
              {[0, 1, 2, 3].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted">
            First digit
            <select
              value={digit}
              onChange={(event) => selectDigit(Number(event.target.value))}
              className="mt-1 block h-8 rounded-lg border border-line bg-white px-2 font-mono text-xs text-navy"
            >
              {Array.from({ length: CHAIN_LENGTH }, (_, index) => index).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
      }
      footer={
        <p>
          <strong className="text-navy">Illustrative only:</strong> H(x) = x² + chain index + 1 mod 257 is not a cryptographic hash. Real WOTS+ uses domain-separated approved hashes and many chains. Reuse lets an observer combine revealed positions; changing other digest digits yields a new message with a valid component.
        </p>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <StepButton active={phase >= 1} done={phase >= 1} onClick={() => { if (phase === 0) setPhase(1); }}>
          1 · Sign first message
        </StepButton>
        <StepButton active={phase >= 2} done={phase >= 2} onClick={() => { if (phase === 1) setPhase(2); }}>
          2 · Reuse key to sign again
        </StepButton>
        <span className="rounded-full border border-line bg-mist-50 px-3 py-1.5 font-mono text-[10px] text-muted">
          {phase === 0 ? "key unused" : phase === 1 ? "one signature released" : "two signatures released"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric label="Chain length" value={`${CHAIN_LENGTH + 1} positions`} />
        <Metric label="First digest digit" value={digit} tone="coral" />
        <Metric label="Second digest digit" value={secondDigit} tone="gold" />
        <Metric label="Public key endpoint" value={endpoint} tone="teal" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-mist-50 p-3">
        <div className="grid min-w-[960px] grid-cols-[repeat(16,minmax(56px,1fr))] gap-2">
          {chain.map((value, position) => {
            const firstReveal = phase >= 1 && position === digit;
            const secondReveal = phase >= 2 && position === secondDigit;
            const endpointNode = position === CHAIN_LENGTH;
            return (
              <div
                key={position}
                className={`rounded-lg border p-2 text-center ${endpointNode ? "border-brand-300 bg-brand-50" : firstReveal ? "border-coral-300 bg-red-50" : secondReveal ? "border-gold-300 bg-amber-50" : "border-line bg-white"}`}
              >
                <p className="font-mono text-[9px] text-muted">x{position}</p>
                <p className="mt-1 font-mono text-xs font-bold text-navy">{firstReveal || secondReveal || endpointNode ? value : "·"}</p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.06em] text-muted">
                  {endpointNode ? "public" : firstReveal ? "sig 1" : secondReveal ? "sig 2" : "hidden"}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-[10px] text-body">H(x) = x² + {chainIndex} + 1 mod {Q} · x₀ = {chain[0]}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">First signature</h4>
          {phase >= 1 ? (
            <>
              <p className="mt-3 font-mono text-sm text-navy">reveal x{digit} = {chain[digit]}</p>
              <p className="mt-2 font-mono text-xs text-body">verifier hashes {CHAIN_LENGTH - digit} more times → {advance(chain[digit], CHAIN_LENGTH - digit, chainIndex)}</p>
              <p className={`mt-2 text-[11px] font-bold ${firstVerified ? "text-emerald-700" : "text-rose-700"}`}>{firstVerified ? "matches public endpoint" : "verification fails"}</p>
            </>
          ) : <p className="mt-3 text-xs text-muted">Sign the first message to reveal position {digit}.</p>}
        </section>
        <section className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Second signature with the same key</h4>
          {phase >= 2 ? (
            <>
              <p className="mt-3 font-mono text-sm text-navy">reveal x{secondDigit} = {chain[secondDigit]}</p>
              <p className="mt-2 font-mono text-xs text-body">verifier hashes {CHAIN_LENGTH - secondDigit} more times → {advance(chain[secondDigit], CHAIN_LENGTH - secondDigit, chainIndex)}</p>
              <p className={`mt-2 text-[11px] font-bold ${secondVerified ? "text-emerald-700" : "text-rose-700"}`}>{secondVerified ? "also matches public endpoint" : "verification fails"}</p>
            </>
          ) : <p className="mt-3 text-xs text-muted">After the first signature, reuse the key to reveal position {secondDigit}.</p>}
        </section>
      </div>

      <section className={`mt-4 rounded-xl border p-4 ${phase >= 2 ? "border-rose-200 bg-rose-50" : "border-dashed border-line bg-white"}`} aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Observer&apos;s forged component</h4>
          {phase >= 2 ? (
            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${forgedVerified ? "border-rose-300 bg-white text-rose-700" : "border-line bg-white text-muted"}`}>
              {forgedVerified ? "forgery verifies" : "not available"}
            </span>
          ) : null}
        </div>
        {phase >= 2 ? (
          <>
            <p className="mt-3 font-mono text-sm text-navy">choose later revealed position x{forgePosition} = {chain[forgePosition]}</p>
            <p className="mt-2 font-mono text-xs text-body">
              hash {CHAIN_LENGTH - forgePosition} more times → {advance(chain[forgePosition], CHAIN_LENGTH - forgePosition, chainIndex)} = public endpoint
            </p>
            <p className="mt-2 text-[11px] leading-5 text-rose-800">
              A new digest can select this digit for the shown chain and different digits elsewhere. Its forged component hashes to the same public key endpoint, so this WOTS+ key is no longer one-time.
            </p>
          </>
        ) : <p className="mt-3 text-xs text-muted">Two different revealed positions are needed for the cross-signature combination.</p>}
      </section>
    </VisualizerShell>
  );
}
