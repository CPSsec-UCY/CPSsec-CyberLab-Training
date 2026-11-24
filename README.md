# CPSsec CyberLab

**An open, citation-backed cybersecurity curriculum with interactive labs and a deep post-quantum track.**

[![CI](https://github.com/CPSsec-UCY/pqc-cyberlab/actions/workflows/ci.yml/badge.svg)](https://github.com/CPSsec-UCY/pqc-cyberlab/actions/workflows/ci.yml)
[![Deploy](https://github.com/CPSsec-UCY/pqc-cyberlab/actions/workflows/deploy.yml/badge.svg)](https://github.com/CPSsec-UCY/pqc-cyberlab/actions/workflows/deploy.yml)
[![License: EUPL-1.2](https://img.shields.io/badge/license-EUPL--1.2-blue.svg)](./LICENSE)

Live site: <https://cpssec-ucy.github.io/pqc-cyberlab/>

CPSsec CyberLab is maintained by the [CPSsec research group](https://github.com/CPSsec-UCY) at the
University of Cyprus. It turns cybersecurity into version-controlled, reviewable courses with
interactive visualisations, verifiable citations and browser-native labs. The curriculum spans
cryptography, networks, distributed systems, security operations, advanced cryptography and
post-quantum migration.

## Why this exists

Security is not one subject. A defender needs cryptography, packet-level visibility, distributed-system
trade-offs, SOC judgement and implementation reality. Post-quantum migration cuts across all of them.
Learners need a path from intuition to implementation without losing the provenance of each claim.

Every module is authored at four **depth lenses**:

| Lens | Audience | What it shows |
| --- | --- | --- |
| **L1 — Intuition & threat model** | Beginners, generalists | Visual mental models, attacker goals, real failure modes, no heavy maths |
| **L2 — Protocol & system mechanics** | Practitioners, engineers, students | Message flows, state machines, layouts, configuration trade-offs |
| **L3 — Formal math & correctness** | Cryptographers, researchers | Definitions, algebraic structures, bounds, reduction sketches |
| **L4 — Implementation & hardware** | Systems and crypto engineers | Constant-time code, SIMD, NTT/Keccak acceleration, side-channel and fault defences |

The lens switcher preserves scroll position and the reader's last choice. Every module covers all four
lenses; CI fails if one is missing.

## Curriculum

| # | Module | Track |
| --- | --- | --- |
| 01 | [The quantum threat](content/modules/quantum-threat.mdx) | Post-Quantum Cryptography |
| 02 | [Public-key primitives](content/modules/asymmetric-primitives.mdx) | Foundations |
| 03 | [Symmetric cryptography and AEAD](content/modules/symmetric-crypto.mdx) | Foundations |
| 04 | [Hashes, MACs and KDFs](content/modules/hashing-mac-kdf.mdx) | Foundations |
| 05 | [Centralised vs decentralised systems](content/modules/centralised-decentralised.mdx) | Distributed Systems & Privacy |
| 06 | [Federated learning](content/modules/federated-learning.mdx) | Distributed Systems & Privacy |
| 07 | [Deep packet inspection](content/modules/deep-packet-inspection.mdx) | Network & Protocol Security |
| 08 | [SOC operations](content/modules/soc-operations.mdx) | Security Operations |
| 09 | [TLS, PKI and hybrid migration](content/modules/tls-pki.mdx) | Network & Protocol Security |
| 10 | [Zero-knowledge proofs and MPC](content/modules/zero-knowledge-mpc.mdx) | Advanced Cryptography |
| 11 | [NTT and polynomial rings](content/modules/ntt-polynomials.mdx) | Post-Quantum Cryptography |
| 12 | [ML-KEM (FIPS 203)](content/modules/ml-kem.mdx) | Post-Quantum Cryptography |
| 13 | [ML-DSA (FIPS 204)](content/modules/ml-dsa.mdx) | Post-Quantum Cryptography |
| 14 | [SLH-DSA (FIPS 205)](content/modules/slh-dsa.mdx) | Post-Quantum Cryptography |
| 15 | [Side channels and constant-time code](content/modules/side-channel.mdx) | Systems & Hardware |

The platform also includes a searchable glossary, a citation registry with BibTeX export, and browser labs for NTT arithmetic, AEAD, hashing, federated learning, DPI, SOC triage and zero-knowledge proofs.

## Architecture

```mermaid
flowchart LR
  MDX["MDX modules<br/>content/modules/*.mdx"] --> NEXT["Next.js static export"]
  CITE["citations.json<br/>DOI · RFC · locator"] --> NEXT
  VAL["validate-content.mjs<br/>CI gate"] --> MDX
  VAL --> CITE
  RUST["Rust crate<br/>wasm/pqc-lab"] --> WASM["pqc_lab.wasm"]
  WASM --> NEXT
  NEXT --> OUT["out/"]
  OUT --> PAGES["GitHub Pages"]
  ACTIONS["GitHub Actions<br/>build · test · deploy"] --> PAGES
```

- **Static hosting:** Next.js 14 static export to GitHub Pages. No backend, no accounts, no analytics.
- **Content:** MDX with structured frontmatter, four `<Lens>` sections and inline `<Cite>` locators.
- **Citations:** `content/citations.json`; a Node validator enforces keys, types, URLs, locators,
  module coverage and inline/frontmatter consistency.
- **Interactivity:** React + Framer Motion for protocol and maths visualisers; SVG is inspectable.
- **Labs:** Rust compiled to `wasm32-unknown-unknown` with a hand-written C ABI plus browser-native labs
  for AEAD, hashing, federated learning, DPI, SOC triage and zero-knowledge proofs. A TypeScript
  fallback runs when Wasm is unavailable.
- **Progress:** localStorage only. Nothing is transmitted.

## Quick start

Requirements:

- Node.js **20** (Node 18.18+ may work locally; CI uses 20)
- Rust with the `wasm32-unknown-unknown` target (optional; a prebuilt Wasm artifact is checked in)

```bash
git clone https://github.com/CPSsec-UCY/pqc-cyberlab.git
cd pqc-cyberlab
npm ci

# optional: rebuild the Wasm lab
npm run build:wasm

npm run dev
# http://localhost:3000
```

For a production build with the GitHub Pages base path:

```bash
NEXT_PUBLIC_BASE_PATH=/pqc-cyberlab npm run build
# static output in out/
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run validate` | Validate citations, frontmatter, lens coverage and glossary links |
| `npm run lint` | Next.js ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Validate then static export |
| `npm run build:wasm` | Compile the Rust lab to `public/wasm/pqc_lab.wasm` |
| `npm run test:wasm` | Rust unit tests (NTT round-trip and multiplication) |
| `npm run validate:links` | Network link check for citation URLs (scheduled in CI) |

## Repository layout

```text
app/                    Next.js routes (home, curriculum, learn, lab, glossary, citations, about)
components/
  citations/            citation provider, inline <Cite>, drawer, registry
  depth/                four-lens provider, switcher and section wrapper
  lab/                  Wasm-backed NTT and compression workbenches
  learning/             knowledge checks and local progress
  modules/              module cards, header, navigation
  visualizers/          protocol and maths animations
  mdx/                  component mapping for MDX
content/
  citations.json        central citation registry
  glossary.json         cross-linked glossary
  modules/*.mdx         the curriculum
lib/                    module/citation/glossary loaders and Wasm engine wrapper
wasm/pqc-lab/           Rust crate and tests
scripts/                content validation, link checking, Wasm build
.github/workflows/      CI, Pages deploy, scheduled link check
```

## Citation policy

- Standards, RFCs, peer-reviewed papers and maintained reference implementations are preferred.
- Every inline claim that depends on an external source carries a precise locator
  (section, page, algorithm, table or RFC section), not just a URL.
- DOI links are used where available; RFCs use their canonical `rfc-editor.org` URLs.
- An inline citation must also appear in the module frontmatter so it is included in the module's
  primary-source list.
- Unknown keys, malformed records, missing locators and missing depth lenses fail `npm run validate`.
- A scheduled workflow checks citation URLs for rot. Link failures are reported as workflow failures.

Corrections are first-class contributions. Open a
[citation correction issue](https://github.com/CPSsec-UCY/pqc-cyberlab/issues/new/choose) or a pull
request.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the authoring workflow, four-lens requirements and
validation commands. Module proposals use the issue template; code and content changes use the PR
template.

- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security policy: [SECURITY.md](./SECURITY.md)
- License: [EUPL-1.2](./LICENSE)

## Build plan status

- **Phase 1 — Foundation & citation engine:** complete.
- **Phase 2 — Core concept modules:** fifteen courses across seven tracks and all four lenses, complete.
- **Phase 3 — Animations & labs:** protocol/maths visualisers, a Rust→Wasm NTT/compression bench, and browser labs for AEAD, hashing, federated learning, DPI, SOC triage and zero-knowledge proofs, complete.
- **Phase 4 — Learning features & community:** roadmap, progress, glossary cross-links, knowledge checks,
  contributor templates; ongoing expansion and review.

## Maintainers

Maintained by **CPSsec-UCY**. For project questions, use
[GitHub Discussions](https://github.com/CPSsec-UCY/pqc-cyberlab/discussions); for security issues, use
the private advisory channel in [SECURITY.md](./SECURITY.md).

## License

Licensed under the European Union Public Licence **EUPL-1.2**. See [LICENSE](./LICENSE).
