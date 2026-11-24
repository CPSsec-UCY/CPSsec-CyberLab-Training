"use client";

import { CITATION_BY_ID } from "@/lib/citations";
import { useCitation } from "@/components/citations/CitationProvider";

interface CiteProps {
  id: string;
  locator?: string;
  label?: string;
}

export function Cite({ id, locator, label }: CiteProps) {
  const { openCitation } = useCitation();
  const citation = CITATION_BY_ID[id];

  if (!citation) {
    return (
      <span className="mx-0.5 inline rounded border border-cyber-rose/40 bg-cyber-rose/10 px-1 font-mono text-[0.72em] text-cyber-rose">
        missing:{id}
      </span>
    );
  }

  const text = label ?? citation.short;
  const suffix = locator ? ` ${locator}` : "";

  return (
    <button
      type="button"
      onClick={() => openCitation(id, locator)}
      title={`${citation.title}${locator ? ` — ${locator}` : ""}`}
      aria-label={`Open citation ${citation.short}${locator ? `, ${locator}` : ""}`}
      className="mx-0.5 inline cursor-pointer whitespace-nowrap rounded border border-cyber-cyan/25 bg-cyber-cyan/5 px-1 py-0 align-baseline font-mono text-[0.72em] font-normal uppercase tracking-[0.04em] text-cyber-cyan no-underline transition hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10"
    >
      {text}
      {suffix ? <span className="text-cyber-cyan/70">{suffix}</span> : null}
    </button>
  );
}
