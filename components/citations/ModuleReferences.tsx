import { getCitations, citationHref, formatAuthors } from "@/lib/citations";
import { Cite } from "@/components/citations/Cite";

export function ModuleReferences({ ids, title = "Primary sources for this module" }: { ids: string[]; title?: string }) {
  const citations = getCitations(ids);
  if (citations.length === 0) return null;

  return (
    <section className="mt-12 rounded-2xl border border-line bg-ink-850/50 p-5" aria-labelledby="module-sources">
      <div className="flex items-center justify-between gap-4">
        <h2 id="module-sources" className="font-mono text-xs uppercase tracking-[0.18em] text-cyber-cyan">
          {title}
        </h2>
        <span className="chip">{citations.length} refs</span>
      </div>
      <ol className="mt-4 space-y-3">
        {citations.map((citation) => (
          <li key={citation.id} className="grid gap-1 text-sm sm:grid-cols-[3rem_1fr]">
            <span className="font-mono text-[11px] text-slate-500">
              [{String(citation.ordinal ?? "").padStart(2, "0")}]
            </span>
            <div>
              <p className="leading-6 text-slate-300">
                {formatAuthors(citation, 8)}.{" "}
                <a href={citationHref(citation)} target="_blank" rel="noreferrer" className="text-slate-100 hover:text-cyber-cyan">
                  {citation.title}
                </a>
                . {citation.container ? <span className="italic">{citation.container}</span> : null}
                {citation.container ? ", " : " "}
                {citation.year}. <Cite id={citation.id} />
              </p>
              {citation.locator ? (
                <p className="font-mono text-[10px] text-slate-500">{citation.locator}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
