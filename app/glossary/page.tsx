import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import { getAllModules } from "@/lib/modules";
import { GlossaryBrowser } from "@/components/GlossaryBrowser";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Definitions for lattice, protocol, implementation and side-channel terms used across the CyberLab curriculum.",
};

export default function GlossaryPage() {
  const moduleTitles = Object.fromEntries(getAllModules().map((module) => [module.slug, module.title]));

  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Glossary</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
        Shared vocabulary, precise definitions.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-body">
        Cross-linked terms from every module. Definitions are deliberately short; follow the citation or
        module link when you need the full argument.
      </p>
      <div className="mt-10">
        <GlossaryBrowser entries={GLOSSARY} moduleTitles={moduleTitles} />
      </div>
    </div>
  );
}
