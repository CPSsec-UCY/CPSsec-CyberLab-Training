export type LensLevel = 1 | 2 | 3 | 4;

export type CitationType =
  | "standard"
  | "report"
  | "paper"
  | "rfc"
  | "internet-draft"
  | "specification"
  | "source"
  | "website";

export interface Citation {
  id: string;
  short: string;
  type: CitationType;
  title: string;
  authors: string[];
  year: number;
  publisher?: string;
  container?: string;
  url: string;
  doi?: string;
  locator?: string;
  tags?: string[];
  ordinal?: number;
}

export type TrackName =
  | "Foundations"
  | "Lattice PQC"
  | "Hash-Based Signatures"
  | "Systems & Deployment";

export type Difficulty = "Introductory" | "Intermediate" | "Advanced";

export interface ModuleMeta {
  slug: string;
  title: string;
  subtitle: string;
  track: TrackName;
  order: number;
  difficulty: Difficulty;
  readingTime: number;
  summary: string;
  citations: string[];
  tags: string[];
  prerequisites: string[];
  updated: string;
  lenses: LensLevel[];
}

export interface Module extends ModuleMeta {
  content: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  aliases?: string[];
  citations?: string[];
  modules?: string[];
  related?: string[];
}
