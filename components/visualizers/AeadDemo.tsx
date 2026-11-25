"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LockKeyhole, RefreshCw, ShieldAlert } from "lucide-react";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function AeadDemo() {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [plaintext, setPlaintext] = useState("Transfer 250 EUR to account 1234");
  const [tamper, setTamper] = useState(false);
  const [output, setOutput] = useState<{ iv: string; ciphertext: string; tag: string; nonce: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "ok" | "fail" | "unsupported">("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (!globalThis.crypto?.subtle) {
      queueMicrotask(() => {
        if (active) setStatus("unsupported");
      });
      return;
    }
    crypto.subtle
      .generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"])
      .then((generated) => {
        if (active) setKey(generated);
      })
      .catch(() => {
        if (active) setStatus("unsupported");
      });
    return () => {
      active = false;
    };
  }, []);

  async function run() {
    if (!key) return;
    setBusy(true);
    setStatus("idle");
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const aad = new TextEncoder().encode("course=cyberlab;record=42");
      const encoded = new TextEncoder().encode(plaintext);
      const encrypted = new Uint8Array(
        await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, key, encoded),
      );
      const body = encrypted.slice(0, encrypted.length - 16);
      const tag = encrypted.slice(encrypted.length - 16);
      const received = new Uint8Array(encrypted);
      if (tamper) received[received.length - 1] ^= 0x01;

      setOutput({ iv: toHex(iv), ciphertext: toHex(body), tag: toHex(tag), nonce: toHex(iv) });
      try {
        await crypto.subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, key, received);
        setStatus("ok");
      } catch {
        setStatus("fail");
      }
    } catch {
      setStatus("unsupported");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-navy">
          <LockKeyhole className="h-4 w-4 text-brand-600" /> AES-256-GCM · 128-bit tag
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTamper((value) => !value)}
            aria-pressed={tamper}
            className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
              tamper ? "border-rose-300 bg-rose-50 text-rose-700" : "border-line bg-white text-body hover:border-brand-200"
            }`}
          >
            {tamper ? "tampering enabled" : "tamper with ciphertext"}
          </button>
          <button type="button" onClick={run} disabled={busy || !key} className="btn-primary px-3 py-1.5 text-[10px]">
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} /> Encrypt &amp; decrypt
          </button>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Plaintext</span>
        <input
          value={plaintext}
          onChange={(event) => setPlaintext(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-line bg-mist-50 px-3 py-2.5 text-sm text-navy focus:border-brand-300 focus:bg-white"
        />
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Nonce (96-bit)</p>
          <p className="mt-1 break-all font-mono text-[10px] text-navy">{output?.nonce ?? "generated per message"}</p>
        </div>
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Ciphertext</p>
          <p className="mt-1 line-clamp-2 break-all font-mono text-[10px] text-navy">{output?.ciphertext ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-line bg-mist-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Authentication tag</p>
          <p className="mt-1 break-all font-mono text-[10px] text-navy">{output?.tag ?? "—"}</p>
        </div>
      </div>

      <div className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${
        status === "ok"
          ? "border-emerald-200 bg-emerald-50"
          : status === "fail"
            ? "border-rose-200 bg-rose-50"
            : "border-line bg-white"
      }`}>
        {status === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : status === "fail" ? <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-600" /> : <LockKeyhole className="mt-0.5 h-4 w-4 text-brand-600" />}
        <p className="text-xs leading-5 text-body">
          {status === "idle" && "Encrypt a message. The tag binds the ciphertext, nonce and associated data. Flip one bit and decryption must fail."}
          {status === "ok" && "Decryption succeeded and the tag verified. Any modification to the ciphertext, nonce or associated data would have been rejected."}
          {status === "fail" && "Decryption rejected: the authentication tag no longer matches. AEAD gives confidentiality and integrity, not nonce-reuse protection."}
          {status === "unsupported" && "Web Crypto is unavailable in this context. The concept still holds: a failed tag check must abort decryption."}
        </p>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-muted">
        Never reuse a nonce with the same key. In GCM, nonce reuse can expose the authentication key and
        break both confidentiality and integrity.
      </p>
    </div>
  );
}
