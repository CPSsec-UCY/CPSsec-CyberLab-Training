import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ModuleMeta } from "@/lib/types";

export function ModuleNav({ prev, next }: { prev?: ModuleMeta; next?: ModuleMeta }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Module navigation">
      {prev ? (
        <Link href={`/learn/${prev.slug}/`} className="group rounded-xl border border-white/10 bg-ink-850/50 p-4 transition hover:border-cyber-cyan/30">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </span>
          <p className="mt-2 font-medium text-slate-200 group-hover:text-cyber-cyan">{prev.title}</p>
        </Link>
      ) : <div className="hidden sm:block" />}
      {next ? (
        <Link href={`/learn/${next.slug}/`} className="group rounded-xl border border-white/10 bg-ink-850/50 p-4 text-right transition hover:border-cyber-cyan/30">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Next <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <p className="mt-2 font-medium text-slate-200 group-hover:text-cyber-cyan">{next.title}</p>
        </Link>
      ) : null}
    </nav>
  );
}
