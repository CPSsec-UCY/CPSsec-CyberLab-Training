# Contributing to CPSsec CyberLab Training

Thank you for helping build an open, citation-backed security curriculum.

By participating, you agree to follow the organisation's
[Code of Conduct](./CODE_OF_CONDUCT.md). For security issues, follow [SECURITY.md](./SECURITY.md)
instead of opening a public issue.

## Ways to contribute

- **New module:** propose it first with the “New module proposal” issue template.
- **Correction:** fix a claim, improve an explanation, or add a precise locator.
- **Citation:** add a primary source or repair a broken/incorrect reference.
- **Visualiser:** improve an existing animation or add a new one with an accessible fallback.
- **Terminal lab:** extend a course's command deck with a realistic workflow, task or failure path.
- **Linux shell:** improve the inert builtins or add a safe virtual lab fixture to a course's Practice section.
- **Wasm lab:** extend the Rust engine, add tests, or improve the TypeScript fallback.
- **Site/accessibility:** keyboard navigation, screen-reader labels, reduced-motion behaviour, layout.

## Local setup

```bash
npm ci
npm run dev
```

Optional Wasm rebuild:

```bash
rustup target add wasm32-unknown-unknown
npm run build:wasm
```

## Authoring a module

Modules live in `content/modules/<slug>.mdx`. The filename must match the `slug`.

### 1. Frontmatter

```yaml
---
slug: example-module
title: "A precise, specific title"
subtitle: "One sentence that explains the angle."
track: "Post-Quantum Cryptography"
order: 9
difficulty: "Advanced"
readingTime: 18
summary: "A 2–3 sentence summary used on cards and in metadata."
citations: ["fips203", "kyber-spec"]
tags: ["pqc", "lattice"]
prerequisites: ["ml-kem"]
updated: "2026-11-24"
lenses: [1, 2, 3, 4]
---
```

Rules:

- `track` must be one of `Foundations`, `Red Team`, `Application Security`, `Identity & Access`,
  `Cloud & Infrastructure`, `Malware & Forensics`, `Digital Forensics & Incident Response`,
  `Software Supply Chain`, `Network & Protocol Security`, `Distributed Systems & Privacy`,
  `Security Operations`, `Systems & Hardware`, `Advanced Cryptography`, `Post-Quantum Cryptography`.
- `order` must be unique across modules.
- `citations` must list every source cited inline. Keys must exist in `content/citations.json`.
- `prerequisites` must refer to existing module slugs.
- `lenses` must be `[1, 2, 3, 4]` when present; all four sections are mandatory.

### 2. Four lenses

Use exactly one section per lens:

```mdx
<Lens level={1} title="Short, concrete framing">
  ...
</Lens>

<Lens level={2} title="Protocol or system view">
  ...
</Lens>

<Lens level={3} title="Definitions and correctness">
  ...
</Lens>

<Lens level={4} title="Implementation and hardware">
  ...
</Lens>
```

Guidance:

- **L1:** no walls of algebra; focus on goals, attacker capabilities and failure modes.
- **L2:** be operational. Include parameters, message flow, state, sizes and pitfalls.
- **L3:** define notation, state assumptions, give bounds or a reduction sketch, and distinguish
  correctness from security.
- **L4:** discuss constant-time code, memory, vectorisation, hardware and side-channel/fault issues.
- Do not duplicate the same paragraphs across lenses. The lens switch should change the abstraction,
  not just the font.

### 3. Citations

Add records to `content/citations.json`:

```json
{
  "id": "fips203",
  "short": "NIST FIPS 203",
  "type": "standard",
  "title": "Module-Lattice-Based Key-Encapsulation Mechanism Standard",
  "authors": ["National Institute of Standards and Technology"],
  "year": 2024,
  "publisher": "U.S. Department of Commerce",
  "url": "https://doi.org/10.6028/NIST.FIPS.203",
  "doi": "10.6028/NIST.FIPS.203",
  "locator": "§5 (K-PKE), §7 (ML-KEM)",
  "tags": ["pqc", "kem", "standard"]
}
```

Cite inline with a locator:

```mdx
... the decapsulation failure rate is below $2^{-138.8}$. <Cite id="fips203" locator="Table 1" />
```

Do not invent a DOI, RFC number, page range or locator. If you cannot verify a source, leave it out
and ask in the issue or discussion. Every source listed in frontmatter should be cited inline;
the validator warns if it is not.

### 4. Interactive elements

- Prefer small, inspectable components from `components/visualizers/`.
- Every control needs a keyboard path and an accessible name.
- Provide a static/experience-preserving fallback under `prefers-reduced-motion`.
- Do not fetch external data from a module.
- If a visualiser makes a quantitative claim, expose the assumptions and cite the source.

Add new components to `components/mdx/index.tsx` so MDX can use them.

### 5. Terminal labs

Every module must include a command lab before `## Key takeaways`:

```mdx
## Run it in a terminal

<One or two sentences naming the tools and what the learner will observe.>

<TerminalLab slug="example-module" />
```

The slug must match the module. The script lives in one of the track files under
`lib/terminals/` (`foundations.ts`, `operations.ts`, `pqc.ts`, and so on) and is keyed by the same
slug. A script provides:

- `title`, `environment`, `prompt`, `intro`, `tools` and a closing `takeaway`;
- `tasks`: the checklist that measures completion, each pointing at one or more command ids;
- `commands`: five or more realistic invocations, each with `summary`, `hint`, `output` and an
  optional `note`. Outputs are teaching fixtures, never live data.

Rules for terminal content:

- Commands must be the real tool shape for the stated version and environment. If a flag or
  subcommand is not real, use a clearly labelled toy CLI instead of an almost-real command.
- State the safe scope in `safety` for anything that scans, acquires, decrypts or modifies state.
- Simulated output must not claim a real result. Use `tone: "warn"` or `tone: "err"` for failure
  paths and explain the consequence in `note`.
- The deck must be usable with the keyboard. Running, inserting and copying a command are separate
  actions; nothing is executed.
- `npm run validate` fails when a module has no `<TerminalLab>`, when the slug is wrong, when the
  script is missing or when a track file has fewer than five commands.

### 6. Linux practice shells

Every `## Practice` section must include one inert shell:

```mdx
## Practice

<LinuxTerminal slug="example-module" />
```

The shell is not a remote container or a host shell. It is a small in-memory Bash-like simulator. It
supports `pwd`, `ls`, `cd`, `cat`, `head`, `tail`, `wc`, `grep`, `find`, `file`, `sha256sum`, `stat`,
`echo`, `printf`, `mkdir`, `touch`, `rm`, `cp`, `mv`, `whoami`, `id`, `uname`, `date`, `env`, `export`,
`which`, `man`, history, Tab completion, `|` pipelines, `>`/`>>` redirection, `;` and `&&`.

Add a fixture in `lib/linuxTerminal/fixtures.ts` with the same slug as the module. Fixtures are plain
text files under `~/lab`; binary artefacts should be represented by an inert text description. The
engine is in `lib/linuxTerminal/engine.ts` and the SHA-256 implementation is isolated in `hash.ts`.

Rules:

- Never imply that a process ran or a network request was sent. The footer states the boundary.
- Keep fixtures small, deterministic and relevant to the module's exercises.
- Course tool commands still come from `lib/terminals/`. When run in the practice shell they replay the
  same output and may create clearly labelled placeholder artefacts.
- Builtins may mutate only the virtual filesystem. Do not add host filesystem, child-process, fetch,
  WebSocket or external-service access.
- `npm run test:linux-shell` checks SHA-256 known answers, pipes, redirection and file operations.
- `npm run validate` fails when a Practice section has no `<LinuxTerminal>`, when the slug is wrong or
  when the fixture is missing. `npm run test:terminals` verifies the exported shell and safety footer.

### 7. Knowledge checks

Use the existing component:

```mdx
<KnowledgeCheck
  question="Which property does the FO transform add?"
  options={["IND-CPA", "IND-CCA2", "EUF-CMA"]}
  answer={1}
  explanation="Re-encryption and implicit rejection upgrade CPA security to IND-CCA2 under the stated assumptions."
/>
```

Include the reasoning in the explanation, not just “because it is correct”.

## Glossary

Add cross-linked terms to `content/glossary.json`. Each entry should have a short definition, at least
one supporting citation, and the modules where it appears. Link related terms by id. The validator
checks module and citation references.

## Wasm / Rust changes

The lab crate is in `wasm/pqc-lab`.

- Keep it `no_std` for the `wasm32-unknown-unknown` build.
- Do not add a runtime or a wasm-bindgen dependency without discussion.
- Add or update unit tests in `src/lib.rs`.
- The exported ABI is intentionally small; keep buffer ids stable or update
  `lib/wasm/pqcLab.ts` and the fallback together.
- Rebuild the artifact and commit `public/wasm/pqc_lab.wasm`:

```bash
npm run test:wasm
npm run build:wasm
```

- The browser wrapper runs `self_test()` and falls back to TypeScript if the ABI or self-test fails.

## Validation before opening a PR

```bash
npm run validate
npm run lint
npm run typecheck
npm run build # includes exported-table and animated-diagram regression checks
```

If you touched Rust/Wasm:

```bash
npm run test:wasm
npm run build:wasm
```

Optional network check:

```bash
npm run validate:links
```

## Review criteria

A change is ready when:

1. The claim is correct or the limitation is explicitly stated.
2. The citation exists, is the right version, and the locator supports the sentence.
3. The abstraction level matches the lens.
4. The interaction is usable without a mouse and does not trap focus.
5. The terminal commands are realistic for the stated tools, safe to teach, and paired with
   interpretable output and failure paths.
6. The Linux practice shell remains inert: no process, network or host filesystem access, and every
   generated artefact is clearly simulated.
7. CI is green and the preview build renders the module.

Cryptographic claims should be reviewed by someone with domain expertise. Note the reviewer in the PR
description if the change affects security statements.
