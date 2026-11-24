"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { SequenceControls } from "@/components/visualizers/SequenceControls";
import { useSequencePlayer } from "@/components/visualizers/useSequencePlayer";
import { Cite } from "@/components/citations/Cite";

const STEPS = [
  {
    title: "Ciphertext arrives",
    detail: "The attacker submits c*. A honest sender would have produced c = Encaps(ek).",
  },
  {
    title: "Decrypt the payload",
    detail: "m' = K-PKE.Decrypt(dk, c*). On a tampered ciphertext this message is effectively random.",
  },
  {
    title: "Re-derive the randomness",
    detail: "(K', r') = G(m' || H(ek)). The key and encryption coins are deterministic functions of the decrypted message.",
  },
  {
    title: "Re-encrypt",
    detail: "c'' = K-PKE.Encrypt(ek, m', r'). A valid ciphertext must reproduce itself under this check.",
  },
  {
    title: "Compare in constant time",
    detail: "The decapsulator compares all ciphertext bytes without early exit. Equality is a single bit.",
  },
];

export function FoTransform() {
  const player = useSequencePlayer(STEPS.length + 1, 2100);
  const step = player.step;
  const [tampered, setTampered] = useState(false);

  function selectCiphertext(value: boolean) {
    setTampered(value);
    player.select(0);
  }

  const accepted = !tampered;
  const terminal = step >= STEPS.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">ciphertext</span>
          <div className="flex overflow-hidden rounded-lg border border-line">
            <button
              type="button"
              onClick={() => selectCiphertext(false)}
              aria-pressed={!tampered}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${!tampered ? "bg-emerald-400/15 text-emerald-300" : "text-slate-400"}`}
            >
              valid c
            </button>
            <button
              type="button"
              onClick={() => selectCiphertext(true)}
              aria-pressed={tampered}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] ${tampered ? "bg-cyber-rose/15 text-cyber-rose" : "text-slate-400"}`}
            >
              tampered c*
            </button>
          </div>
        </div>
      </div>

      <SequenceControls
        label="Fujisaki–Okamoto transform"
        step={player.step}
        length={STEPS.length + 1}
        playing={player.playing}
        onSelect={player.select}
        onToggle={player.toggle}
        onRestart={player.restart}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((item, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <div key={item.title} className="relative">
              <button
                type="button"
                onClick={() => player.select(index)}
                className={`h-full w-full rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-cyber-cyan/50 bg-cyber-cyan/10 shadow-glow"
                    : done
                      ? "border-emerald-400/25 bg-emerald-400/[0.05]"
                      : "border-line bg-ink-950/50 hover:border-line-strong"
                }`}
              >
                <span className={`font-mono text-[9px] uppercase tracking-[0.14em] ${active ? "text-cyber-cyan" : "text-slate-500"}`}>
                  step {index + 1}
                </span>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-200">{item.title}</p>
              </button>
              {index < STEPS.length - 1 ? (
                <ArrowDown className="mx-auto my-1 h-3 w-3 text-slate-700 lg:hidden" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-line bg-ink-950/50 p-4" aria-live={player.playing ? "off" : "polite"}>
        {!terminal ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-cyan">
              Step {step + 1} · {STEPS[step].title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{STEPS[step].detail}</p>
            <motion.div
              key={`${step}-${tampered}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-lg border border-line bg-ink-900 p-3 font-mono text-[11px] leading-6 text-slate-300"
            >
              {step === 0 ? (tampered ? "c* ≠ c  (flipped byte detected nowhere yet)" : "c* = c  (well-formed ciphertext)") : null}
              {step === 1 ? (tampered ? "m' = random-looking ≠ m" : "m' = m") : null}
              {step === 2 ? (tampered ? "(K', r') = G(m' || H(ek))  → unrelated to sender state" : "(K', r') = G(m || H(ek))  → sender state") : null}
              {step === 3 ? (tampered ? "c'' = Enc(ek, m', r')  → c'' ≠ c*" : "c'' = Enc(ek, m, r)  → c'' = c*") : null}
              {step === 4 ? "constant_time_equal(c'', c*) ∈ {0, 1}" : null}
            </motion.div>
          </>
        ) : (
          <div className={`flex items-start gap-3 rounded-lg border p-3 ${
            accepted ? "border-emerald-400/30 bg-emerald-400/10" : "border-cyber-rose/30 bg-cyber-rose/10"
          }`}>
            {accepted ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" /> : <ShieldAlert className="mt-0.5 h-5 w-5 text-cyber-rose" />}
            <div>
              <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${accepted ? "text-emerald-300" : "text-cyber-rose"}`}>
                {accepted ? "Accept · return K'" : "Implicit reject · return J(z || c*)"}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-300">
                {accepted
                  ? "The re-encryption matches, so the recovered key is returned. An attacker learns nothing beyond the shared secret."
                  : "The re-encryption differs, so decapsulation returns a pseudorandom key derived from the rejection secret z. The attacker cannot distinguish this from a valid key without solving the underlying problem."}
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        The check must be constant-time: comparing ciphertexts with an early-exit <code className="rounded bg-mist-200 px-1 font-mono">memcmp</code>{" "}
        leaks how many bytes an attacker guessed correctly. <Cite id="fips203" locator="§7.3" />{" "}
        <Cite id="fujisaki-okamoto2013" locator="pp. 80–101" />
      </p>
    </div>
  );
}
