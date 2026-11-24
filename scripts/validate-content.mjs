#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { z } from "zod";

const root = process.cwd();
const modulesDir = path.join(root, "content", "modules");
const citationsFile = path.join(root, "content", "citations.json");
const glossaryFile = path.join(root, "content", "glossary.json");

const errors = [];
const warnings = [];

const TRACKS = ["Foundations", "Lattice PQC", "Hash-Based Signatures", "Systems & Deployment"];
const DIFFICULTIES = ["Introductory", "Intermediate", "Advanced"];
const CITATION_TYPES = [
  "standard",
  "report",
  "paper",
  "rfc",
  "internet-draft",
  "specification",
  "source",
  "website",
];

const citationSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  short: z.string().min(1),
  type: z.enum(CITATION_TYPES),
  title: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  year: z.number().int().min(1900).max(2100),
  publisher: z.string().optional(),
  container: z.string().optional(),
  url: z.string().url(),
  doi: z.string().optional(),
  locator: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const moduleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.string().min(8),
  subtitle: z.string().min(8),
  track: z.enum(TRACKS),
  order: z.number().int().positive(),
  difficulty: z.enum(DIFFICULTIES),
  readingTime: z.number().int().positive().max(180),
  summary: z.string().min(30),
  citations: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lenses: z.array(z.number().int().min(1).max(4)).optional(),
});

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, file)}: invalid JSON (${error.message})`);
    return null;
  }
}

const citations = readJson(citationsFile);
const citationIds = new Set();

if (Array.isArray(citations)) {
  for (const [index, citation] of citations.entries()) {
    const parsed = citationSchema.safeParse(citation);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`citations[${index}] (${citation?.id ?? "no-id"}): ${issue.path.join(".") || "record"} — ${issue.message}`);
      }
      continue;
    }
    if (citationIds.has(citation.id)) {
      errors.push(`citations: duplicate id "${citation.id}"`);
    }
    citationIds.add(citation.id);
    if (citation.doi && !/^10\.\d{4,9}\/\S+$/i.test(citation.doi)) {
      errors.push(`citations.${citation.id}: DOI does not look like a DOI (${citation.doi})`);
    }
    if (!citation.url.startsWith("https://") && !citation.url.startsWith("http://")) {
      errors.push(`citations.${citation.id}: URL must be http(s)`);
    }
  }
} else {
  errors.push("content/citations.json must be a JSON array");
}

const glossary = readJson(glossaryFile);
const glossaryIds = new Set();
if (Array.isArray(glossary)) {
  const glossarySchema = z.object({
    id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    term: z.string().min(1),
    definition: z.string().min(20),
    aliases: z.array(z.string()).optional(),
    citations: z.array(z.string()).optional(),
    modules: z.array(z.string()).optional(),
    related: z.array(z.string()).optional(),
  });
  for (const [index, entry] of glossary.entries()) {
    const parsed = glossarySchema.safeParse(entry);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`glossary[${index}] (${entry?.id ?? "no-id"}): ${issue.path.join(".")} — ${issue.message}`);
      }
      continue;
    }
    if (glossaryIds.has(entry.id)) errors.push(`glossary: duplicate id "${entry.id}"`);
    glossaryIds.add(entry.id);
    for (const id of entry.citations ?? []) {
      if (!citationIds.has(id)) errors.push(`glossary.${entry.id}: unknown citation "${id}"`);
    }
  }
} else {
  errors.push("content/glossary.json must be a JSON array");
}

const moduleFiles = fs.existsSync(modulesDir)
  ? fs.readdirSync(modulesDir).filter((file) => file.endsWith(".mdx")).sort()
  : [];

if (moduleFiles.length === 0) errors.push("content/modules: no .mdx modules found");

const slugs = new Set();
const orders = new Map();
const moduleSlugs = new Set();
const usedCitations = new Set();

for (const file of moduleFiles) {
  const relative = `content/modules/${file}`;
  const raw = fs.readFileSync(path.join(modulesDir, file), "utf8");
  let parsedFile;
  try {
    parsedFile = matter(raw);
  } catch (error) {
    errors.push(`${relative}: invalid frontmatter (${error.message})`);
    continue;
  }

  const parsed = moduleSchema.safeParse(parsedFile.data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push(`${relative}: ${issue.path.join(".") || "frontmatter"} — ${issue.message}`);
    }
    continue;
  }

  const data = parsed.data;
  const expectedSlug = file.replace(/\.mdx$/, "");
  moduleSlugs.add(data.slug);

  if (data.slug !== expectedSlug) {
    errors.push(`${relative}: slug "${data.slug}" must match filename "${expectedSlug}"`);
  }
  if (slugs.has(data.slug)) errors.push(`${relative}: duplicate slug "${data.slug}"`);
  slugs.add(data.slug);

  if (orders.has(data.order)) {
    errors.push(`${relative}: order ${data.order} already used by ${orders.get(data.order)}`);
  } else {
    orders.set(data.order, relative);
  }

  for (const prerequisite of data.prerequisites) {
    if (!moduleSlugs.has(prerequisite) && !fs.existsSync(path.join(modulesDir, `${prerequisite}.mdx`))) {
      errors.push(`${relative}: unknown prerequisite "${prerequisite}"`);
    }
  }

  const inlineCites = [...parsedFile.content.matchAll(/<Cite\s+[^>]*\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  const frontmatterCites = new Set(data.citations);

  for (const id of frontmatterCites) {
    if (!citationIds.has(id)) {
      errors.push(`${relative}: frontmatter cites unknown source "${id}"`);
    }
  }
  for (const id of inlineCites) {
    usedCitations.add(id);
    if (!citationIds.has(id)) {
      errors.push(`${relative}: inline <Cite> references unknown source "${id}"`);
    }
    if (!frontmatterCites.has(id)) {
      errors.push(`${relative}: inline citation "${id}" is missing from frontmatter citations`);
    }
  }

  for (const id of frontmatterCites) {
    if (!inlineCites.includes(id)) {
      warnings.push(`${relative}: "${id}" is listed in frontmatter but never cited inline`);
    }
  }

  const lensLevels = [...parsedFile.content.matchAll(/<Lens\s+[^>]*\blevel=\{?["']?([1-4])["']?\}?/g)].map((match) => Number(match[1]));
  const lensOpens = (parsedFile.content.match(/<Lens\b/g) ?? []).length;
  const lensCloses = (parsedFile.content.match(/<\/Lens>/g) ?? []).length;

  if (lensOpens !== lensCloses) {
    errors.push(`${relative}: ${lensOpens} <Lens> tags but ${lensCloses} </Lens> tags`);
  }
  for (const level of [1, 2, 3, 4]) {
    const count = lensLevels.filter((entry) => entry === level).length;
    if (count !== 1) {
      errors.push(`${relative}: expected exactly one Lens level ${level}, found ${count}`);
    }
  }
  if (lensLevels.length !== 4) {
    errors.push(`${relative}: expected four Lens sections, found ${lensLevels.length}`);
  }

  if (data.lenses && JSON.stringify([...data.lenses].sort()) !== JSON.stringify([1, 2, 3, 4])) {
    errors.push(`${relative}: frontmatter lenses must be [1,2,3,4] when present`);
  }

  for (const [index, block] of parsedFile.content.split(/<\/Lens>/).slice(0, -1).entries()) {
    if (block.replace(/<[^>]+>/g, "").trim().length < 180) {
      warnings.push(`${relative}: Lens section ${index + 1} looks thin (<180 characters of prose)`);
    }
  }
}

for (const id of citationIds) {
  if (!usedCitations.has(id) && moduleFiles.length > 0) {
    warnings.push(`citation "${id}" is not cited by any module`);
  }
}

if (Array.isArray(glossary)) {
  for (const entry of glossary) {
    for (const slug of entry.modules ?? []) {
      if (!moduleSlugs.has(slug) && !fs.existsSync(path.join(modulesDir, `${slug}.mdx`))) {
        errors.push(`glossary.${entry.id}: unknown module "${slug}"`);
      }
    }
    for (const related of entry.related ?? []) {
      if (!glossaryIds.has(related)) errors.push(`glossary.${entry.id}: unknown related term "${related}"`);
    }
  }
}

const total = moduleFiles.length;
if (errors.length > 0) {
  console.error(`\nContent validation failed with ${errors.length} error(s):\n`);
  for (const error of errors) console.error(`  ERROR  ${error}`);
  if (warnings.length > 0) {
    console.error(`\n${warnings.length} warning(s):`);
    for (const warning of warnings) console.error(`  WARN   ${warning}`);
  }
  console.error("");
  process.exit(1);
}

console.log(`Content validation passed.`);
console.log(`  modules:   ${total}`);
console.log(`  citations: ${citationIds.size} (${usedCitations.size} cited inline)`);
console.log(`  glossary:  ${glossaryIds.size}`);
if (warnings.length > 0) {
  console.log(`  warnings:  ${warnings.length}`);
  for (const warning of warnings) console.log(`    WARN  ${warning}`);
}
