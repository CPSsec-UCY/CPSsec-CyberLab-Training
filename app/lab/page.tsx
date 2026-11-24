import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode2, ShieldCheck, Sigma, Wrench } from "lucide-react";
import { LabWorkbench } from "@/components/lab/LabWorkbench";
import { Cite } from "@/components/citations/Cite";

export const metadata: Metadata = {
  title: "PQC math lab",
  description:
    "Run negacyclic NTTs, polynomial multiplication, compression rounding and PQC parameter comparisons in the browser via Rust WebAssembly.",
};

export default function LabPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div>
          <p className="eyebrow">Interactive lab</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            The PQC math lab.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Real ring arithmetic, not a video. The engine is compiled from Rust to WebAssembly, runs a
            deterministic self-test on load, and exposes every intermediate array for inspection. A
            TypeScript fallback keeps the page usable when Wasm is blocked.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/ntt-polynomials/" className="btn-ghost">
            Read the NTT module
          </Link>
          <Link href="/learn/ml-kem/" className="btn-ghost">
            ML-KEM deep dive
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <LabWorkbench />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-850/50 p-5">
          <FileCode2 className="h-5 w-5 text-cyber-cyan" />
          <h2 className="mt-3 text-sm font-semibold text-white">What runs in Wasm</h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Pre-twisted negacyclic NTT, inverse NTT, point-wise multiplication, schoolbook convolution,
            compression/decompression and a self-test. The Rust crate is in{" "}
            <code className="font-mono text-slate-300">wasm/pqc-lab</code> and is rebuilt in CI.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-850/50 p-5">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="mt-3 text-sm font-semibold text-white">Safe to experiment</h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            No secrets, no network calls after the Wasm file loads, no backend. Everything runs locally in
            your browser tab and progress never leaves localStorage.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-850/50 p-5">
          <Wrench className="h-5 w-5 text-cyber-violet" />
          <h2 className="mt-3 text-sm font-semibold text-white">Parameters that match the standards</h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Sizes are taken from <Cite id="fips203" />, <Cite id="fips204" />, <Cite id="fips205" /> and the
            Classic McEliece specification. The lab ring is an instructional n = 128 instance over q = 3329; see
            the note under the NTT bench for the ML-KEM n = 256 difference.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyber-cyan/20 bg-cyber-cyan/[0.05] p-5">
        <div className="flex items-center gap-3">
          <Sigma className="h-5 w-5 text-cyber-cyan" />
          <p className="text-sm text-slate-300">
            Want the derivation behind the butterflies? Read L3 of the NTT module, then run the same values here.
          </p>
        </div>
        <Link href="/learn/ntt-polynomials/" className="btn-primary">
          Open module <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
