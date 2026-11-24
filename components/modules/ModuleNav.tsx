import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ModuleMeta } from "@/lib/types";

export function ModuleNav({ prev, next }: { prev?: ModuleMeta; next?: ModuleMeta }) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Module navigation">
      {prev ? (
        <Link href={`/learn/${prev.slug}/`} className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            <ArrowLeft className="h-3.5 w-3.5" /> Previous course
          </span>
          <p className="mt-2 font-semibold text-navy group-hover:text-brand-700">{prev.title}</p>
        </Link>
      ) : <div className="hidden sm:block" />}
      {next ? (
        <Link href={`/learn/${next.slug}/`} className="group rounded-2xl border border-line bg-white p-4 text-right transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
            Next course <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <p className="mt-2 font-semibold text-navy group-hover:text-brand-700">{next.title}</p>
        </Link>
      ) : null}
    </nav>
  );
}
