"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cite } from "@/components/citations/Cite";

interface Row {
  name: string;
  level: number;
  pk: number;
  sk: number;
  payload: number;
}

interface Family {
  id: "ml-kem" | "ml-dsa" | "slh-dsa" | "mceliece";
  label: string;
  kind: "KEM" | "Signature";
  payloadLabel: string;
  citation: string;
  note: string;
  rows: Row[];
}

const FAMILIES: Family[] = [
  {
    id: "ml-kem",
    label: "ML-KEM",
    kind: "KEM",
    payloadLabel: "ciphertext",
    citation: "fips203",
    note: "FIPS 203 · module lattices · ML-KEM uses 32-byte shared secrets at every level.",
    rows: [
      { name: "ML-KEM-512", level: 1, pk: 800, sk: 1632, payload: 768 },
      { name: "ML-KEM-768", level: 3, pk: 1184, sk: 2400, payload: 1088 },
      { name: "ML-KEM-1024", level: 5, pk: 1568, sk: 3168, payload: 1568 },
    ],
  },
  {
    id: "ml-dsa",
    label: "ML-DSA",
    kind: "Signature",
    payloadLabel: "signature",
    citation: "fips204",
    note: "FIPS 204 · module lattices · signatures are dominated by the z vector and hint encoding.",
    rows: [
      { name: "ML-DSA-44", level: 2, pk: 1312, sk: 2560, payload: 2420 },
      { name: "ML-DSA-65", level: 3, pk: 1952, sk: 4032, payload: 3309 },
      { name: "ML-DSA-87", level: 5, pk: 2592, sk: 4896, payload: 4627 },
    ],
  },
  {
    id: "slh-dsa",
    label: "SLH-DSA",
    kind: "Signature",
    payloadLabel: "signature",
    citation: "fips205",
    note: "FIPS 205 · hash-based · small keys, large signatures; “s” favours size, “f” favours speed.",
    rows: [
      { name: "SLH-DSA-SHA2-128s", level: 1, pk: 32, sk: 64, payload: 7856 },
      { name: "SLH-DSA-SHA2-128f", level: 1, pk: 32, sk: 64, payload: 17088 },
      { name: "SLH-DSA-SHA2-192s", level: 3, pk: 48, sk: 96, payload: 16224 },
      { name: "SLH-DSA-SHA2-192f", level: 3, pk: 48, sk: 96, payload: 35664 },
      { name: "SLH-DSA-SHA2-256s", level: 5, pk: 64, sk: 128, payload: 29792 },
      { name: "SLH-DSA-SHA2-256f", level: 5, pk: 64, sk: 128, payload: 49856 },
    ],
  },
  {
    id: "mceliece",
    label: "Classic McEliece",
    kind: "KEM",
    payloadLabel: "ciphertext",
    citation: "mceliece-spec",
    note: "Code-based · conservative security, tiny ciphertexts, megabyte-scale public keys.",
    rows: [
      { name: "mceliece348864", level: 1, pk: 261120, sk: 6492, payload: 96 },
      { name: "mceliece460896", level: 3, pk: 524160, sk: 13568, payload: 156 },
      { name: "mceliece6688128", level: 5, pk: 1044992, sk: 13892, payload: 208 },
      { name: "mceliece8192128", level: 5, pk: 1357824, sk: 14080, payload: 208 },
    ],
  },
];

function barWidth(value: number, max: number) {
  return `${Math.max(3, (Math.log10(value + 1) / Math.log10(max + 1)) * 100)}%`;
}

export function ParameterExplorer() {
  const [selected, setSelected] = useState<Family["id"]>("ml-kem");
  const family = FAMILIES.find((item) => item.id === selected) ?? FAMILIES[0];
  const max = Math.max(...family.rows.flatMap((row) => [row.pk, row.sk, row.payload]));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FAMILIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            aria-pressed={selected === item.id}
            className={`rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${
              selected === item.id
                ? "border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan"
                : "border-white/10 bg-ink-950/40 text-slate-400 hover:border-white/25 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead className="bg-white/[0.04] font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="px-3 py-2.5">Parameter set</th>
              <th className="px-3 py-2.5">NIST cat.</th>
              <th className="px-3 py-2.5">Public key</th>
              <th className="px-3 py-2.5">Secret key</th>
              <th className="px-3 py-2.5">{family.payloadLabel}</th>
            </tr>
          </thead>
          <tbody>
            {family.rows.map((row) => (
              <tr key={row.name} className="border-t border-white/5">
                <td className="px-3 py-3 font-mono text-[11px] text-slate-200">{row.name}</td>
                <td className="px-3 py-3">
                  <span className="rounded border border-cyber-violet/30 bg-cyber-violet/10 px-1.5 py-0.5 font-mono text-[9px] text-cyber-violet">
                    {row.level}
                  </span>
                </td>
                {([
                  ["pk", row.pk],
                  ["sk", row.sk],
                  ["payload", row.payload],
                ] as const).map(([key, value]) => (
                  <td key={key} className="px-3 py-3">
                    <div className="font-mono text-[10px] text-slate-400">{value.toLocaleString("en-GB")} B</div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-700">
                      <motion.div
                        key={`${row.name}-${key}-${value}`}
                        initial={false}
                        animate={{ width: barWidth(value, max) }}
                        transition={{ duration: 0.35 }}
                        className={key === "pk" ? "h-full bg-cyber-cyan/70" : key === "sk" ? "h-full bg-cyber-violet/70" : "h-full bg-cyber-amber/70"}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-cyber-cyan/70" /> public key</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-cyber-violet/70" /> secret key</span>
        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-4 rounded bg-cyber-amber/70" /> {family.payloadLabel}</span>
        <span className="ml-auto">bars use a log scale · <Cite id={family.citation} /></span>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">{family.note}</p>
    </div>
  );
}
