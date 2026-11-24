"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { CITATIONS, citationHref, formatAuthors, toBibtex } from "@/lib/citations";
import { useCitation } from "@/components/citations/CitationProvider";
import type { Citation } from "@/lib/types";

const TYPES = ["all", "standard", "rfc", "paper", "specification", "report", "internet-draft", "source", "website"];

const TYPE_LABEL: Record<string, string> = {
  standard: "Standard",
  report: "Report",
  paper: "Paper",
  rfc: "RFC",
  "internet-draft": "Draft",
  specification: "Spec",
  source: "Source",
  website: "Web",
};

export function CitationRegistry({ usage }: { usage: Record<string, string[]> }) {
  const { openCitation } = useCitation();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CITATIONS.filter((citation) => {
      if (type !== "all" && citation.type !== type) return false;
      if (!q) return true;
      const haystack = [
        citation.id,
        citation.short,
        citation.title,
        citation.authors.join(" "),
        citation.year,
        citation.container ?? "",
        citation.publisher ?? "",
        (citation.tags ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, type]);

  function downloadBibtex() {
    const body = filtered.map(toBibtex).join("\n\n");
    const blob = new Blob([body], { type: "application/x-bibtex" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pqc-cyberlab-references.bib";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-850/60 p-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search citations</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, DOI, keyword…"
            className="w-full rounded-lg border border-white/10 bg-ink-950/70 py-2.5 pl-9 pr-3 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyber-cyan/50"
          />
        </label>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="citation-type">
            Filter by type
          </label>
          <select
            id="citation-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-300 focus:border-cyber-cyan/50"
          >
            {TYPES.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All types" : (TYPE_LABEL[option] ?? option)}
              </option>
            ))}
          </select>
          <button type="button" onClick={downloadBibtex} className="btn-ghost whitespace-nowrap">
            <Download className="h-4 w-4" />
            .bib
          </button>
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {filtered.length} of {CITATIONS.length} references
      </p>

      <ul className="mt-4 space-y-3">
        {filtered.map((citation) => (
          <CitationRow
            key={citation.id}
            citation={citation}
            usage={usage[citation.id] ?? []}
            onOpen={() => openCitation(citation.id)}
          />
        ))}
      </ul>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
          No references match that query.
        </div>
      ) : null}
    </div>
  );
}

function CitationRow({
  citation,
  usage,
  onOpen,
}: {
  citation: Citation;
  usage: string[];
  onOpen: () => void;
}) {
  return (
    <li className="group grid gap-4 rounded-xl border border-white/10 bg-ink-850/50 p-4 transition hover:border-cyber-cyan/30 sm:grid-cols-[56px_1fr_auto] sm:items-start">
      <div className="font-mono text-xs text-slate-500">
        [{String(citation.ordinal ?? "").padStart(2, "0")}]
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{TYPE_LABEL[citation.type] ?? citation.type}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyber-cyan">{citation.short}</span>
          <span className="font-mono text-[10px] text-slate-500">{citation.year}</span>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 block text-left text-sm font-medium leading-6 text-slate-100 hover:text-cyber-cyan"
        >
          {citation.title}
        </button>
        <p className="mt-1 text-xs text-slate-400">{formatAuthors(citation, 5)}</p>
        {citation.container || citation.publisher ? (
          <p className="mt-0.5 text-xs italic text-slate-500">{citation.container ?? citation.publisher}</p>
        ) : null}
        {citation.locator ? (
          <p className="mt-2 font-mono text-[10px] leading-5 text-slate-500">Locator: {citation.locator}</p>
        ) : null}
        {usage.length > 0 ? (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            Used in
            {usage.map((slug) => (
              <Link key={slug} href={`/learn/${slug}/`} className="text-cyber-cyan/80 hover:text-cyber-cyan hover:underline">
                {slug}
              </Link>
            ))}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        <button type="button" onClick={onOpen} className="btn-ghost px-3 py-1.5 text-[10px]">
          Cite
        </button>
        <a
          href={citationHref(citation)}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 hover:text-cyber-cyan"
        >
          Open
        </a>
      </div>
    </li>
  );
}
