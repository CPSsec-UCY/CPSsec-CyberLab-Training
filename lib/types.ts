export type LensLevel = 1 | 2 | 3 | 4;

export type CitationType =
  | "standard"
  | "report"
  | "paper"
  | "rfc"
  | "internet-draft"
  | "specification"
  | "source"
  | "website"
  | "book";

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
  | "Red Team"
  | "Application Security"
  | "Identity & Access"
  | "Cloud & Infrastructure"
  | "Malware & Forensics"
  | "Digital Forensics & Incident Response"
  | "Software Supply Chain"
  | "Post-Quantum Cryptography"
  | "Network & Protocol Security"
  | "Distributed Systems & Privacy"
  | "Security Operations"
  | "Systems & Hardware"
  | "Advanced Cryptography";

export type Difficulty = "Introductory" | "Intermediate" | "Advanced";

export interface CourseChapter {
  level: LensLevel;
  title: string;
}

export interface ModuleMeta {
  slug: string;
  title: string;
  subtitle: string;
  track: TrackName;
  order: number;
  difficulty: Difficulty;
  readingTime: number;
  summary: string;
  outcomes: string[];
  citations: string[];
  tags: string[];
  prerequisites: string[];
  updated: string;
  lenses: LensLevel[];
}

export interface Module extends ModuleMeta {
  content: string;
  chapters: CourseChapter[];
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
