#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "parse5";

const outDir = path.resolve(process.argv[2] ?? "out");
const failures = [];
let diagrams = 0;

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? "";
}

function descendants(node) {
  const result = [];
  for (const child of node.childNodes ?? []) {
    result.push(child, ...descendants(child));
  }
  return result;
}

function collect(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Static export not found at ${directory}. Run "npm run build" first.`);
  }
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collect(filePath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(filePath);
  }
  return files;
}

for (const filePath of collect(outDir)) {
  const document = parse(fs.readFileSync(filePath, "utf8"));
  for (const node of descendants(document)) {
    if (node.tagName !== "section" || attr(node, "aria-label") !== "Animated process diagram") continue;
    diagrams += 1;
    const controls = descendants(node);
    const hasPlaybackGroup = controls.some(
      (child) => child.tagName === "div" && attr(child, "role") === "group" && attr(child, "aria-label").endsWith("playback controls"),
    );
    const hasPlayPause = controls.some(
      (child) => child.tagName === "button" && /^(Play|Pause) /.test(attr(child, "aria-label")),
    );
    const hasScrubber = controls.some((child) => child.tagName === "input" && attr(child, "type") === "range");
    if (!hasPlaybackGroup || !hasPlayPause || !hasScrubber) {
      failures.push(`${path.relative(outDir, filePath)}: animated process diagram lacks accessible playback controls`);
    }
  }
}

if (diagrams === 0) failures.push("No exported animated process diagrams were found.");
if (failures.length > 0) {
  console.error(`Animated-diagram check failed (${failures.length} issue(s)):`);
  for (const failure of failures) console.error(`  ERROR  ${failure}`);
  process.exit(1);
}

console.log("Animated-diagram check passed.");
console.log(`  process diagrams with accessible controls: ${diagrams}`);
