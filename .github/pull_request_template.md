## What changed

<!-- One or two sentences. Link the issue if there is one. -->

## Type of change

- [ ] New module (`content/modules/*.mdx`)
- [ ] Content correction or citation update
- [ ] Animation / visualizer
- [ ] WebAssembly lab / Rust source
- [ ] Site, accessibility or CI change
- [ ] Documentation

## Module checklist (if applicable)

- [ ] All four lens sections are present: L1, L2, L3, L4.
- [ ] Every factual claim has an inline `<Cite>` with a precise locator.
- [ ] New citation keys exist in `content/citations.json` and are listed in module frontmatter.
- [ ] Frontmatter has a unique `order`, a valid `track`, a summary and an `updated` date.
- [ ] Glossary terms link to this module where appropriate.
- [ ] Interactive components are keyboard accessible and have reduced-motion fallbacks.

## Verification

- [ ] `npm run validate`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build` (or the CI preview artifact looks correct)
- [ ] `npm run test:wasm` and `npm run build:wasm` (if Rust/Wasm changed)

## Citation / security review

<!-- For cryptographic claims, note who reviewed the correctness and the sources. -->
