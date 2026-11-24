#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const citations = JSON.parse(fs.readFileSync(path.join(root, "content", "citations.json"), "utf8"));
const urls = [...new Set(citations.map((citation) => citation.url))];

const CONCURRENCY = 6;
const USER_AGENT =
  "Mozilla/5.0 (compatible; CPSsec-CyberLab-link-check/1.0; +https://github.com/CPSsec-UCY/pqc-cyberlab)";
const BLOCKED_STATUSES = new Set([401, 403, 429, 451]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function check(url) {
  const attempt = async (method) => {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
      signal: AbortSignal.timeout(20000),
    });
    return response;
  };

  let lastStatus = 0;
  for (let attemptIndex = 0; attemptIndex < 2; attemptIndex += 1) {
    try {
      let response = await attempt("HEAD");
      // Some publishers reject or mishandle HEAD while serving GET correctly.
      if (response.status >= 400) {
        response = await attempt("GET");
      }
      lastStatus = response.status;
      if (response.status < 400) {
        return { url, status: response.status, ok: true };
      }
      if (BLOCKED_STATUSES.has(response.status)) {
        return { url, status: response.status, ok: true, warning: `blocked by publisher (${response.status})` };
      }
      if (response.status >= 500) {
        await sleep(500 * (attemptIndex + 1));
        continue;
      }
      return { url, status: response.status, ok: false };
    } catch (error) {
      lastStatus = 0;
      await sleep(500 * (attemptIndex + 1));
      if (attemptIndex === 1) {
        return {
          url,
          status: 0,
          ok: true,
          warning: `network error after retries: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
  }

  return { url, status: lastStatus, ok: lastStatus < 500, warning: lastStatus >= 500 ? `server error ${lastStatus}` : undefined };
}

const results = [];
let cursor = 0;

async function worker() {
  while (cursor < urls.length) {
    const index = cursor;
    cursor += 1;
    const result = await check(urls[index]);
    results.push(result);
    const label = result.ok ? (result.warning ? "WARN" : "OK  ") : "FAIL";
    console.log(`${label} ${result.status || "ERR"} ${result.url}${result.warning ? ` — ${result.warning}` : ""}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const failures = results.filter((result) => !result.ok);
const warnings = results.filter((result) => result.ok && result.warning);
console.log(
  `\nChecked ${results.length} URLs: ${results.length - failures.length - warnings.length} ok, ` +
    `${warnings.length} warning(s), ${failures.length} failed.`,
);

if (failures.length > 0) {
  console.error("\nLink check failures:");
  for (const failure of failures) console.error(`  ${failure.url} (${failure.status || failure.error})`);
  process.exit(1);
}
