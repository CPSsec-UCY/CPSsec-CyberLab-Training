import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCode2, ShieldCheck, Sigma, Wrench } from "lucide-react";
import { LabWorkbench } from "@/components/lab/LabWorkbench";
import { Cite } from "@/components/citations/Cite";
import { LabCatalog } from "@/components/labs/LabCatalog";

export const metadata: Metadata = {
  title: "Interactive labs",
  description:
    "Explore 32 interactive workbenches across red team, AppSec, identity, cloud, malware, DFIR, SOC, privacy, protocols and post-quantum cryptography.",
};

export default function LabPage() {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div>
          <p className="eyebrow">Interactive lab</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
            Interactive security labs.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-body">
            Real computation, not a video. The PQC bench is compiled from Rust to WebAssembly, runs a
            deterministic self-test on load, and exposes every intermediate array. The catalogue below
            adds safe simulations for red-team ranges, web exploitation, cloud attack paths, malware
            reverse engineering, rootkits, DFIR timelines, threat hunting, identity flows and more.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/learn/symmetric-crypto/" className="btn-ghost">AEAD lab</Link>
          <Link href="/learn/federated-learning/" className="btn-ghost">Federated lab</Link>
          <Link href="/learn/soc-operations/" className="btn-ghost">SOC triage</Link>
        </div>
      </div>

      <div className="mt-10">
        <LabWorkbench />
      </div>

      <LabCatalog />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-5">
          <FileCode2 className="h-5 w-5 text-brand-700" />
          <h2 className="mt-3 text-sm font-semibold text-navy">What runs in Wasm</h2>
          <p className="mt-2 text-xs leading-6 text-body">
            Pre-twisted negacyclic NTT, inverse NTT, point-wise multiplication, schoolbook convolution,
            compression/decompression and a self-test. The Rust crate is in{" "}
            <code className="font-mono text-body">wasm/pqc-lab</code> and is rebuilt in CI.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h2 className="mt-3 text-sm font-semibold text-navy">Safe to experiment</h2>
          <p className="mt-2 text-xs leading-6 text-body">
            No secrets, no network calls after the Wasm file loads, no backend. Everything runs locally in
            your browser tab and progress never leaves localStorage.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-5">
          <Wrench className="h-5 w-5 text-coral-600" />
          <h2 className="mt-3 text-sm font-semibold text-navy">Parameters that match the standards</h2>
          <p className="mt-2 text-xs leading-6 text-body">
            Sizes are taken from <Cite id="fips203" />, <Cite id="fips204" />, <Cite id="fips205" /> and the
            Classic McEliece specification. The lab ring is an instructional n = 128 instance over q = 3329; see
            the note under the NTT bench for the ML-KEM n = 256 difference.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex items-center gap-3">
          <Sigma className="h-5 w-5 text-brand-700" />
          <p className="text-sm text-body">
            Want the derivation behind the butterflies? Read L3 of the NTT module, then run the same values here. The other labs are embedded in their courses.
          </p>
        </div>
        <Link href="/learn/ntt-polynomials/" className="btn-primary">
          Open module <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
