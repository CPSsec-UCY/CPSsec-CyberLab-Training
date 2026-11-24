import rawGlossary from "@/content/glossary.json";
import type { GlossaryEntry } from "@/lib/types";

export const GLOSSARY: GlossaryEntry[] = rawGlossary as GlossaryEntry[];

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.id === id);
}

export function glossaryTermsForModule(slug: string): GlossaryEntry[] {
  return GLOSSARY.filter((entry) => entry.modules?.includes(slug));
}
