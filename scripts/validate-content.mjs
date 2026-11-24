#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const root = process.cwd();
const modulesDir = path.join(root, "content", "modules");
const citationsFile = path.join(root, "content", "citations.json");
const glossaryFile = path.join(root, "content", "glossary.json");

const errors = [];
const warnings = [];

const TRACKS = [
  "Foundations",
  "Red Team",
  "Application Security",
  "Identity & Access",
  "Cloud & Infrastructure",
  "Malware & Forensics",
  "Digital Forensics & Incident Response",
  "Software Supply Chain",
  "Post-Quantum Cryptography",
  "Network & Protocol Security",
  "Distributed Systems & Privacy",
  "Security Operations",
  "Systems & Hardware",
  "Advanced Cryptography",
];
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
  "book",
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
  outcomes: z.array(z.string().min(8)).min(3),
  citations: z.array(z.string()).min(1),
  tags: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lenses: z.array(z.number().int().min(1).max(4)).optional(),
});

const proseParser = unified().use(remarkParse).use(remarkGfm);

function countWords(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function htmlToText(value) {
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ");
}

/**
 * Count learner-visible prose instead of raw MDX tokens. Code blocks, component
 * attributes, workshop arrays and other JSX expressions must not make a thin
 * lesson appear to satisfy the depth requirement.
 */
function countProseWords(markdown) {
  const tree = proseParser.parse(markdown);

  function visit(node) {
    if (["code", "inlineCode", "mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type)) {
      return 0;
    }
    if (node.type === "html") return countWords(htmlToText(node.value));
    if (node.type === "text") return countWords(node.value);
    return (node.children ?? []).reduce((total, child) => total + visit(child), 0);
  }

  return visit(tree);
}

function duplicateParagraphs(markdown) {
  const tree = proseParser.parse(markdown);
  const seen = new Map();
  const duplicates = [];

  function text(node) {
    if (node.type === "text") return node.value;
    if (node.type === "html") return htmlToText(node.value);
    if (["code", "inlineCode", "mdxjsEsm", "mdxFlowExpression", "mdxTextExpression"].includes(node.type)) return "";
    return (node.children ?? []).map(text).join(" ");
  }

  function visit(node) {
    if (node.type === "paragraph") {
      const normalized = text(node).replace(/\s+/g, " ").trim().toLowerCase();
      if (normalized.length >= 120) {
        if (seen.has(normalized)) duplicates.push(seen.get(normalized));
        else seen.set(normalized, normalized);
      }
    }
    for (const child of node.children ?? []) visit(child);
  }

  visit(tree);
  return duplicates;
}

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

function checkComponentCitations(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      checkComponentCitations(filePath);
      continue;
    }
    if (!entry.name.endsWith(".tsx")) continue;
    const source = fs.readFileSync(filePath, "utf8");
    const relative = path.relative(root, filePath);
    for (const tag of source.matchAll(/<Cite\s+[^>]*>/g)) {
      const id = tag[0].match(/\bid=["']([^"']+)["']/)?.[1];
      if (!id) continue;
      if (!citationIds.has(id)) errors.push(`${relative}: component <Cite> references unknown source "${id}"`);
      if (!/\blocator=["'][^"']+["']/.test(tag[0])) {
        errors.push(`${relative}: component <Cite> must include a precise non-empty locator (${tag[0]})`);
      }
    }
  }
}

checkComponentCitations(path.join(root, "components"));

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

  for (const tag of parsedFile.content.matchAll(/<Cite\s+[^>]*>/g)) {
    const locator = tag[0].match(/\blocator=["']([^"']+)["']/)?.[1]?.trim();
    if (!locator) {
      errors.push(`${relative}: inline <Cite> must include a precise non-empty locator (${tag[0]})`);
    }
  }

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

  const proseWordCount = countProseWords(parsedFile.content);
  for (const duplicate of duplicateParagraphs(parsedFile.content)) {
    warnings.push(`${relative}: repeated learner-visible paragraph begins "${duplicate.slice(0, 90)}…"`);
  }
  const figureCount = (parsedFile.content.match(/<Figure\b/g) ?? []).length;
  const checkCount = (parsedFile.content.match(/<KnowledgeCheck\b/g) ?? []).length;
  if (proseWordCount < 3800) {
    errors.push(`${relative}: only ${proseWordCount} words of learner-visible prose; modules require at least 3800 words of detailed learning content`);
  }
  if (figureCount < 1) {
    errors.push(`${relative}: no <Figure> illustration found`);
  }
  if (checkCount < 1) {
    errors.push(`${relative}: no <KnowledgeCheck> interaction found`);
  }
  const workedExampleCount = (parsedFile.content.match(/<WorkedExample\b/g) ?? []).length;
  const processFlowCount = (parsedFile.content.match(/<ProcessFlow\b/g) ?? []).length;
  const workshopCount = (parsedFile.content.match(/<GuidedWorkshop\b/g) ?? []).length;
  if (workedExampleCount < 2) {
    errors.push(`${relative}: expected at least two <WorkedExample> components, found ${workedExampleCount}`);
  }
  if (processFlowCount < 1) {
    errors.push(`${relative}: no <ProcessFlow> diagram found`);
  }
  if (workshopCount < 1) {
    errors.push(`${relative}: no <GuidedWorkshop> applied exercise found`);
  }
  if (!parsedFile.content.includes("## Key takeaways")) {
    errors.push(`${relative}: missing a Key takeaways recap section`);
  }
  if (!parsedFile.content.includes("## Practice")) {
    errors.push(`${relative}: missing a Practice exercise section`);
  }

  if (data.lenses && JSON.stringify([...data.lenses].sort()) !== JSON.stringify([1, 2, 3, 4])) {
    errors.push(`${relative}: frontmatter lenses must be [1,2,3,4] when present`);
  }

  const lensBodies = [...parsedFile.content.matchAll(/<Lens\s+[^>]*>([\s\S]*?)<\/Lens>/g)];
  for (const [index, match] of lensBodies.entries()) {
    const proseCount = countProseWords(match[1]);
    if (proseCount < 450) {
      warnings.push(`${relative}: Lens section ${index + 1} looks thin (${proseCount} words of learner-visible prose; target at least 450)`);
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
