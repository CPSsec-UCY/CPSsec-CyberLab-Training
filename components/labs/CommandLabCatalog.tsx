"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, TerminalSquare } from "lucide-react";
import { TERMINAL_SUMMARIES } from "@/lib/terminals";

export function CommandLabCatalog() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMINAL_SUMMARIES;
    return TERMINAL_SUMMARIES.filter((terminal) =>
      [terminal.slug, terminal.title, terminal.environment, ...terminal.tools].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section id="command-labs" className="mt-16 scroll-mt-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Command labs</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Type the commands. Read the output. Learn the workflow.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
            {TERMINAL_SUMMARIES.length} guided terminals, one per course. Each deck walks through the real tool
            invocations for that domain and shows the evidence a practitioner would inspect. Everything is a
            local simulation: commands never execute and no network request is made.
          </p>
        </div>
        <span className="chip">
          <TerminalSquare className="h-3.5 w-3.5" /> {TERMINAL_SUMMARIES.length} terminals
        </span>
      </div>

      <label className="relative mt-6 block max-w-xl">
        <span className="sr-only">Search command labs</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a terminal, tool or workflow…"
          className="w-full rounded-xl border border-line bg-white px-11 py-3 text-sm text-navy shadow-card placeholder:text-muted focus:border-brand-300"
        />
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((terminal) => (
          <Link
            key={terminal.slug}
            href={`/learn/${terminal.slug}/#terminal-${terminal.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-float"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-brand-700">
                <TerminalSquare className="h-3 w-3" /> terminal
              </span>
              <ArrowUpRight className="h-4 w-4 text-brand-300 transition group-hover:text-brand-700" />
            </div>
            <h3 className="mt-3 text-sm font-bold leading-5 text-navy group-hover:text-brand-700">{terminal.title}</h3>
            <p className="mt-1 flex-1 text-[10px] leading-5 text-muted">{terminal.environment}</p>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
              {terminal.commandCount} commands · {terminal.taskCount} tasks →
            </p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-body">
          No terminal matches that search. Try a tool name such as <code className="font-mono">openssl</code> or{" "}
          <code className="font-mono">tshark</code>.
        </div>
      ) : null}
    </section>
  );
}
