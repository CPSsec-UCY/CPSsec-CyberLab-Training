#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const outDir = path.resolve(process.argv[2] ?? "out");
const modulesDir = path.resolve(process.argv[3] ?? "content/modules");
const failures = [];
let terminals = 0;
let commands = 0;

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? "";
}

function descendants(node) {
  const result = [];
  for (const child of node.childNodes ?? []) result.push(child, ...descendants(child));
  return result;
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value ?? "";
  return (node.childNodes ?? []).map(textContent).join("");
}

if (!fs.existsSync(outDir)) {
  throw new Error(`Static export not found at ${outDir}. Run "npm run build" first.`);
}
if (!fs.existsSync(modulesDir)) {
  throw new Error(`Module source not found at ${modulesDir}.`);
}

const expected = fs
  .readdirSync(modulesDir)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.replace(/\.mdx$/, ""))
  .sort();

for (const slug of expected) {
  const filePath = path.join(outDir, "learn", slug, "index.html");
  if (!fs.existsSync(filePath)) {
    failures.push(`learn/${slug}: exported page is missing`);
    continue;
  }
  const html = fs.readFileSync(filePath, "utf8");
  const document = parse(html);
  const sections = descendants(document).filter(
    (node) => node.tagName === "section" && attr(node, "aria-label") === "Interactive terminal lab",
  );

  if (sections.length !== 1) {
    failures.push(`learn/${slug}: expected exactly one interactive terminal lab, found ${sections.length}`);
    continue;
  }

  const section = sections[0];
  const nodes = descendants(section);
  const copyButtons = nodes.filter(
    (node) => node.tagName === "button" && attr(node, "aria-label").startsWith("Copy command:"),
  );
  const input = nodes.find((node) => node.tagName === "input" && attr(node, "id") === `terminal-input-${slug}`);
  const log = nodes.find((node) => attr(node, "role") === "log");
  const content = textContent(section);

  if (!input) failures.push(`learn/${slug}: terminal input is missing`);
  if (!log) failures.push(`learn/${slug}: terminal log region is missing`);
  if (!content.includes("Command deck")) failures.push(`learn/${slug}: command deck did not render`);
  if (!content.includes("Simulated shell ready")) failures.push(`learn/${slug}: terminal welcome state did not render`);
  if (copyButtons.length < 5) {
    failures.push(`learn/${slug}: expected at least five command-deck entries, found ${copyButtons.length}`);
  }

  terminals += 1;
  commands += copyButtons.length;
}

if (expected.length === 0) failures.push("No modules were found to check.");

if (failures.length > 0) {
  console.error(`Terminal lab check failed (${failures.length} issue(s)):`);
  for (const failure of failures) console.error(`  ERROR  ${failure}`);
  process.exit(1);
}

console.log("Terminal lab check passed.");
console.log(`  modules:   ${expected.length}`);
console.log(`  terminals: ${terminals} (${commands} commands in rendered decks)`);
