"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, Server, User } from "lucide-react";
import { SequenceControls } from "@/components/visualizers/SequenceControls";
import { useSequencePlayer } from "@/components/visualizers/useSequencePlayer";
import { Cite } from "@/components/citations/Cite";

const FLIGHT = [
  {
    side: "client" as const,
    title: "ClientHello",
    detail:
      "Offers the hybrid group X25519MLKEM768 in supported_groups and sends a 1,216-byte key share: the ML-KEM-768 encapsulation key (1,184 B) followed by the X25519 share (32 B). It also advertises ML-DSA-65 for authentication.",
    size: 1300,
  },
  {
    side: "server" as const,
    title: "ServerHello",
    detail:
      "Selects the hybrid group and returns a 1,120-byte key share: the ML-KEM-768 ciphertext (1,088 B) followed by the X25519 share (32 B). Both sides form the 64-byte shared secret in the same ML-KEM-then-X25519 order.",
    size: 1200,
  },
  {
    side: "server" as const,
    title: "Certificate + CertificateVerify",
    detail:
      "The server sends its PQC certificate chain and signs the transcript with ML-DSA-65 (3,309 B signature). Certificate chains dominate the expanded handshake.",
    size: 8200,
  },
  {
    side: "client" as const,
    title: "Client Finished",
    detail:
      "The client verifies the certificate and signature, derives the same hybrid secret, and sends a Finished MAC over the transcript. Both directions are now keyed.",
    size: 80,
  },
  {
    side: "server" as const,
    title: "Application data",
    detail:
      "Records are protected with AES-256-GCM or ChaCha20-Poly1305 under keys derived from the hybrid secret. Larger handshake flights may need TCP segmentation or TLS record fragmentation.",
    size: 64,
  },
];

export function TlsHandshake() {
  const player = useSequencePlayer(FLIGHT.length, 2800);
  const active = player.step;
  const item = FLIGHT[active];

  return (
    <div>
      <div className="space-y-2">
        {FLIGHT.map((step, index) => {
          const isActive = index === active;
          const client = step.side === "client";
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => player.select(index)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                isActive
                  ? "border-cyber-cyan/40 bg-cyber-cyan/[0.07]"
                  : "border-line bg-ink-950/40 hover:border-line-strong"
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                client ? "border-cyber-violet/30 bg-cyber-violet/10 text-cyber-violet" : "border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan"
              }`}>
                {client ? <User className="h-3.5 w-3.5" /> : <Server className="h-3.5 w-3.5" />}
              </span>
              <span className="flex-1">
                <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                  {client ? "client → server" : "server → client"}
                </span>
                <span className="block text-xs text-slate-200">{step.title}</span>
              </span>
              <span className="font-mono text-[9px] text-slate-500">≈ {step.size.toLocaleString("en-GB")} B</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-line bg-ink-950/50 p-4"
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyber-cyan">
          <ArrowLeftRight className="h-3.5 w-3.5" />
          flight {active + 1} · {item.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
      </motion.div>

      <SequenceControls
        label="TLS handshake"
        step={player.step}
        length={FLIGHT.length}
        playing={player.playing}
        onSelect={player.select}
        onToggle={player.toggle}
        onRestart={player.restart}
      />

      <div className="mt-4 rounded-lg border border-cyber-amber/25 bg-cyber-amber/[0.06] p-3 text-[11px] leading-5 text-slate-400">
        A classical TLS 1.3 handshake often fits comfortably below common path MTUs. PQC keys and signatures
        can push the first flight past 4 KB, exposing fragmentation bugs and middlebox assumptions. Hybrid
        groups can retain a negotiated classical fallback during staged rollout, but it must be
        policy-controlled, observable and retired. Never silently downgrade after a PQ error.{" "}
        <Cite id="rfc9846" locator="§4.3.7–4.3.8" /> <Cite id="hybrid-design" locator="§3.1–3.3" />{" "}
        <Cite id="rfc10024" locator="§4.1–4.3" />
      </div>
    </div>
  );
}
