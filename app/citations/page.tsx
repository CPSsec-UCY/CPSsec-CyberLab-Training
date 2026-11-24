import type { Metadata } from "next";
import { CITATIONS } from "@/lib/citations";
import { getAllModules } from "@/lib/modules";
import { CitationRegistry } from "@/components/citations/CitationRegistry";
import { Stat } from "@/components/ui/Stat";

export const metadata: Metadata = {
  title: "Citation registry",
  description:
    "Every standard, RFC, paper and implementation referenced by CPSsec CyberLab Training, with DOI links, locators and BibTeX.",
};

export default function CitationsPage() {
  const learningModules = getAllModules();
  const moduleTitles = Object.fromEntries(learningModules.map((learningModule) => [learningModule.slug, learningModule.title]));
  const usage: Record<string, string[]> = {};
  for (const learningModule of learningModules) {
    for (const id of learningModule.citations) {
      usage[id] = [...(usage[id] ?? []), learningModule.slug];
    }
  }

  const types = new Set(CITATIONS.map((citation) => citation.type));

  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Provenance</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
        Citation registry.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-body">
        A single machine-validated database of primary sources. Inline references in modules open the same
        records; CI rejects unknown keys, malformed metadata and missing locators.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={String(CITATIONS.length)} label="references" />
        <Stat value={String(types.size)} label="source types" />
        <Stat value="DOI / RFC" label="resolvable links" />
        <Stat value="BibTeX" label="one-click export" />
      </div>

      <div className="mt-10">
        <CitationRegistry usage={usage} moduleTitles={moduleTitles} />
      </div>

      <div className="mt-10 rounded-xl border border-line bg-white p-5 text-sm leading-6 text-body">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-700">Citation policy</p>
        <p className="mt-2">
          Each module claims a precise locator (section, page, algorithm number or RFC section). Standards
          are cited by their DOI where one exists, and RFCs by their canonical rfc-editor URL. If a source
          cannot be verified, it should not be cited. Open a pull request with{" "}
          <span className="font-mono text-body">[citation]</span> in the title to correct a record.
        </p>
      </div>
    </div>
  );
}
