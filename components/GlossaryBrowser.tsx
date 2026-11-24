"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Cite } from "@/components/citations/Cite";
import type { GlossaryEntry } from "@/lib/types";

export function GlossaryBrowser({
  entries,
  moduleTitles,
}: {
  entries: GlossaryEntry[];
  moduleTitles: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const moduleOptions = useMemo(() => {
    const slugs = new Set<string>();
    for (const entry of entries) for (const slug of entry.modules ?? []) slugs.add(slug);
    return [...slugs].sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (moduleFilter !== "all" && !entry.modules?.includes(moduleFilter)) return false;
        if (!q) return true;
        const haystack = [entry.term, entry.definition, ...(entry.aliases ?? [])].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [entries, moduleFilter, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search glossary</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a term or alias…"
            className="w-full rounded-lg border border-line bg-mist-50 py-2.5 pl-9 pr-3 font-mono text-xs text-navy placeholder:text-muted focus:border-cyber-cyan/50"
          />
        </label>
        <label>
          <span className="sr-only">Filter by module</span>
          <select
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            className="w-full rounded-lg border border-line bg-mist-50 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-slate-300 focus:border-cyber-cyan/50 sm:w-auto"
          >
            <option value="all">All modules</option>
            {moduleOptions.map((slug) => (
              <option key={slug} value={slug}>
                {moduleTitles[slug] ?? slug}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {filtered.length} of {entries.length} terms
      </p>

      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((entry) => (
          <div key={entry.id} id={entry.id} className="rounded-xl border border-line bg-white p-4 scroll-mt-28">
            <div className="flex items-start justify-between gap-3">
              <dt className="font-semibold text-slate-100">{entry.term}</dt>
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">{entry.id}</span>
            </div>
            {entry.aliases && entry.aliases.length > 0 ? (
              <p className="mt-0.5 font-mono text-[10px] text-slate-500">{entry.aliases.join(" · ")}</p>
            ) : null}
            <dd className="mt-2 text-sm leading-6 text-slate-400">{entry.definition}</dd>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(entry.citations ?? []).map((id) => (
                <Cite key={id} id={id} />
              ))}
              <span className="ml-auto flex flex-wrap gap-1.5">
                {(entry.modules ?? []).map((slug) => (
                  <Link
                    key={slug}
                    href={`/learn/${slug}/`}
                    className="font-mono text-[9px] uppercase tracking-[0.08em] text-slate-500 hover:text-cyber-cyan"
                  >
                    {moduleTitles[slug] ?? slug}
                  </Link>
                ))}
              </span>
            </div>
          </div>
        ))}
      </dl>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-sm text-slate-400">
          No glossary entry matches that query.
        </div>
      ) : null}
    </div>
  );
}
