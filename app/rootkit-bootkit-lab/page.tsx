import type { Metadata } from "next";
import Link from "next/link";
import { RootkitBootkitLab } from "@/components/visualizers/RootkitBootkitLab";

export const metadata: Metadata = {
  title: "Boot-chain and persistence explorer",
  description: "Conceptual user-mode, kernel, bootloader and UEFI persistence with Secure Boot and attestation controls.",
};

export default function RootkitBootkitLabPage() {
  return (
    <main className="min-h-screen bg-mist-50 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link href="/learn/rootkits-bootkits/" className="text-[11px] font-bold text-brand-700 hover:underline">
            Back to course
          </Link>
          <span className="rounded-full border border-line bg-white px-3 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">
            Conceptual interactive lab
          </span>
        </div>
        <RootkitBootkitLab />
      </div>
    </main>
  );
}
