# Security policy

## Reporting a vulnerability

Please **do not** open a public issue for a security vulnerability.

Use GitHub Security Advisories:

<https://github.com/CPSsec-UCY/pqc-cyberlab/security/advisories/new>

Include:

- the affected page, component or workflow,
- a minimal reproduction,
- the impact (e.g. XSS, dependency compromise, supply-chain issue),
- any suggested fix.

We will acknowledge the report, investigate, and coordinate disclosure.

## Scope

This repository is a static educational site. The most relevant risks are:

- cross-site scripting or unsafe HTML/MDX rendering,
- compromised dependencies or GitHub Actions,
- accidental exposure of secrets,
- misleading security claims in educational content.

Cryptographic correctness of the **teaching** implementations is not a production security guarantee. The
Wasm lab is deliberately reduced and is not intended to protect secrets. Do not deploy it as a
cryptographic library.

## Supported versions

The `main` branch is the supported version. Deployments are rebuilt from `main` on every push.
