"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, X } from "lucide-react";
import { CITATION_BY_ID, citationHref, formatAuthors, toBibtex } from "@/lib/citations";
import type { Citation } from "@/lib/types";

interface CitationTarget {
  id: string;
  locator?: string;
}

interface CitationContextValue {
  openCitation: (id: string, locator?: string) => void;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function useCitation(): CitationContextValue {
  const value = useContext(CitationContext);
  if (!value) throw new Error("useCitation must be used inside CitationProvider");
  return value;
}

const TYPE_LABEL: Record<string, string> = {
  standard: "Standard",
  report: "Report",
  paper: "Paper",
  rfc: "RFC",
  "internet-draft": "Internet-Draft",
  specification: "Specification",
  source: "Source code",
  website: "Website",
};

function CopyBibtex({ citation }: { citation: Citation }) {
  const [copied, setCopied] = useState(false);
  const bibtex = useMemo(() => toBibtex(citation), [citation]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-mist-50">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">BibTeX</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 hover:border-cyber-cyan/40 hover:text-cyber-cyan"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all p-3 text-[11px] leading-5 text-slate-300">
        <code>{bibtex}</code>
      </pre>
    </div>
  );
}

export function CitationProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<CitationTarget | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const openCitation = useCallback((id: string, locator?: string) => {
    if (!CITATION_BY_ID[id]) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setTarget({ id, locator });
  }, []);

  const close = useCallback(() => setTarget(null), []);

  useEffect(() => {
    if (!target) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = [...drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [target, close]);

  const citation = target ? CITATION_BY_ID[target.id] : null;

  return (
    <CitationContext.Provider value={{ openCitation }}>
      {children}
      <AnimatePresence>
        {target && citation ? (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Close citation"
              className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
              onClick={close}
            />
            <motion.aside
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="citation-title"
              className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-line bg-ink-900 shadow-panel"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="chip">{TYPE_LABEL[citation.type] ?? citation.type}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    Reference {String(citation.ordinal ?? "").padStart(2, "0")}
                  </span>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-line p-2 text-slate-400 hover:text-navy"
                  aria-label="Close citation drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6 px-5 py-6">
                <div>
                  <h2 id="citation-title" className="text-xl font-semibold leading-snug text-navy">
                    {citation.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {formatAuthors(citation, 8)} · {citation.year}
                  </p>
                  {citation.container ? (
                    <p className="mt-1 text-sm italic text-slate-500">{citation.container}</p>
                  ) : null}
                  {citation.publisher ? (
                    <p className="mt-1 text-sm text-slate-500">{citation.publisher}</p>
                  ) : null}
                </div>

                {target.locator || citation.locator ? (
                  <div className="rounded-xl border border-cyber-cyan/20 bg-cyber-cyan/[0.06] p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-cyan">
                      Verified locator
                    </p>
                    <p className="mt-2 font-mono text-sm text-slate-200">
                      {target.locator ?? citation.locator}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-2 text-sm">
                  {citation.doi ? (
                    <a
                      href={`https://doi.org/${citation.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-cyber-cyan hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      DOI: {citation.doi}
                    </a>
                  ) : null}
                  <a
                    href={citationHref(citation)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 break-all text-slate-300 hover:text-cyber-cyan"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {citation.url}
                  </a>
                </div>

                <CopyBibtex citation={citation} />

                <div className="flex flex-wrap items-center gap-2">
                  {(citation.tags ?? []).map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-line bg-mist-50 p-4 text-xs leading-6 text-slate-400">
                  This drawer is part of the citation engine. Inline claims carry a source and a locator;
                  CI fails when a citation key is missing or malformed.{" "}
                  <Link href="/citations/" className="text-cyber-cyan hover:underline" onClick={close}>
                    Browse the full registry
                  </Link>
                  .
                </div>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </CitationContext.Provider>
  );
}
