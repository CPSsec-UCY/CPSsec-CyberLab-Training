"use client";

import { useEffect, useMemo, useState } from "react";
import { Fingerprint } from "lucide-react";

async function sha256(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return new Uint8Array(digest);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bit(byte: number, index: number): number {
  return (byte >> (7 - index)) & 1;
}

export function HashAvalanche() {
  const [left, setLeft] = useState("cyberlab");
  const [right, setRight] = useState("Cyberlab");
  const [digests, setDigests] = useState<{ left: Uint8Array; right: Uint8Array } | null>(null);

  useEffect(() => {
    let active = true;
    if (!globalThis.crypto?.subtle) return;
    Promise.all([sha256(left), sha256(right)]).then(([a, b]) => {
      if (active) setDigests({ left: a, right: b });
    });
    return () => {
      active = false;
    };
  }, [left, right]);

  const comparison = useMemo(() => {
    if (!digests) return null;
    let differing = 0;
    const bits: { equal: boolean }[] = [];
    for (let byte = 0; byte < 32; byte += 1) {
      for (let index = 0; index < 8; index += 1) {
        const same = bit(digests.left[byte], index) === bit(digests.right[byte], index);
        if (!same) differing += 1;
        bits.push({ equal: same });
      }
    }
    return { differing, bits };
  }, [digests]);

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-navy">
        <Fingerprint className="h-4 w-4 text-brand-600" /> SHA-256 · one-character change
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Message A</span>
          <input value={left} onChange={(event) => setLeft(event.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white" />
        </label>
        <label>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Message B</span>
          <input value={right} onChange={(event) => setRight(event.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 font-mono text-xs text-navy focus:border-brand-300 focus:bg-white" />
        </label>
      </div>

      {digests ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-mist-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">digest A</p>
              <p className="mt-1 break-all font-mono text-[10px] text-navy">{toHex(digests.left)}</p>
            </div>
            <div className="rounded-xl border border-line bg-mist-50 p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">digest B</p>
              <p className="mt-1 break-all font-mono text-[10px] text-navy">{toHex(digests.right)}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">bit comparison</span>
              <span className="text-[10px] font-semibold text-brand-700">
                {comparison?.differing}/256 bits differ ({comparison ? Math.round((comparison.differing / 256) * 100) : 0}%)
              </span>
            </div>
            <div className="mt-3 grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[2px]">
              {comparison?.bits.map((entry, index) => (
                <span key={index} className={`aspect-square rounded-[1px] ${entry.equal ? "bg-emerald-200" : "bg-coral-400"}`} />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-4 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-200" /> same</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-coral-400" /> different</span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-xs text-muted">Web Crypto is unavailable; hashing cannot run in this context.</p>
      )}

      <p className="mt-3 text-[11px] leading-5 text-muted">
        A secure hash behaves like a random function: changing one input bit should flip about half the
        output bits. This avalanche effect is necessary, not sufficient — collision resistance and
        preimage resistance are separate properties.
      </p>
    </div>
  );
}
