import rawCitations from "@/content/citations.json";
import type { Citation } from "@/lib/types";

const citations = rawCitations as Citation[];

export const CITATIONS: Citation[] = citations.map((citation, index) => ({
  ...citation,
  ordinal: index + 1,
}));

export const CITATION_BY_ID: Record<string, Citation> = Object.fromEntries(
  CITATIONS.map((citation) => [citation.id, citation]),
);

export function getCitation(id: string): Citation | undefined {
  return CITATION_BY_ID[id];
}

export function getCitations(ids: string[]): Citation[] {
  return ids.map(getCitation).filter((citation): citation is Citation => Boolean(citation));
}

export function citationHref(citation: Citation): string {
  return citation.doi ? `https://doi.org/${citation.doi}` : citation.url;
}

export function citationHost(citation: Citation): string {
  try {
    return new URL(citationHref(citation)).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export function formatAuthors(citation: Citation, max = 3): string {
  const authors = citation.authors;
  if (authors.length <= max) return authors.join(", ");
  return `${authors.slice(0, max).join(", ")}, et al.`;
}

export function toBibtex(citation: Citation): string {
  const proceedings = citation.container?.toLowerCase().includes("proceedings");
  const entryType =
    citation.type === "paper"
      ? proceedings
        ? "inproceedings"
        : "article"
      : citation.type === "rfc" || citation.type === "internet-draft"
        ? "misc"
        : citation.type === "standard" || citation.type === "report"
          ? "techreport"
          : "misc";

  const fields: [string, string | undefined][] = [
    ["title", citation.title],
    ["author", citation.authors.join(" and ")],
    ["year", String(citation.year)],
    ["publisher", citation.publisher],
    ["booktitle", proceedings ? citation.container : undefined],
    ["journal", !proceedings ? citation.container : undefined],
    ["doi", citation.doi],
    ["url", citation.url],
    ["note", citation.locator],
  ];

  const body = fields
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `  ${key} = {${value}}`)
    .join(",\n");

  return `@${entryType}{${citation.id},\n${body}\n}`;
}
