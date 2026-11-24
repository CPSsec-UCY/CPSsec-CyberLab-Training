#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const outDir = path.resolve(process.argv[2] ?? "out");
const failures = [];
const htmlFiles = [];
let tables = 0;
let modulePages = 0;
let moduleTables = 0;

function collect(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Static export not found at ${directory}. Run "npm run build" first.`);
  }
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(filePath);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(filePath);
  }
}

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? "";
}

function hasHorizontalOverflow(node) {
  return attr(node, "class")
    .split(/\s+/)
    .some((className) => className === "overflow-x-auto" || className === "overflow-auto");
}

function inspect(filePath) {
  const document = parse(fs.readFileSync(filePath, "utf8"));
  const isModulePage = filePath.includes(`${path.sep}learn${path.sep}`);
  if (isModulePage) modulePages += 1;

  function visit(node, ancestors) {
    if (node.tagName === "table") {
      tables += 1;
      if (isModulePage) moduleTables += 1;
      const scrollContainer = [...ancestors].reverse().find(hasHorizontalOverflow);
      if (!scrollContainer) {
        failures.push(`${path.relative(outDir, filePath)}: <table> has no horizontal-overflow ancestor`);
      } else if (
        attr(scrollContainer, "role") !== "region" ||
        attr(scrollContainer, "tabindex") !== "0" ||
        !attr(scrollContainer, "aria-label")
      ) {
        failures.push(`${path.relative(outDir, filePath)}: table scroll region is not keyboard-accessible and labelled`);
      }
    }
    for (const child of node.childNodes ?? []) visit(child, [...ancestors, node]);
  }

  visit(document, []);
}

collect(outDir);
for (const filePath of htmlFiles) inspect(filePath);

if (modulePages === 0) failures.push("No exported /learn/ pages were found.");
if (moduleTables === 0) failures.push("No rendered tables were found in exported module pages.");

if (failures.length > 0) {
  console.error(`Table rendering check failed (${failures.length} issue(s)):`);
  for (const failure of failures) console.error(`  ERROR  ${failure}`);
  process.exit(1);
}

console.log("Table rendering check passed.");
console.log(`  html files: ${htmlFiles.length}`);
console.log(`  tables:     ${tables} (${moduleTables} across ${modulePages} module pages)`);
