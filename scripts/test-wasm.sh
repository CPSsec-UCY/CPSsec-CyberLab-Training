#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/wasm/pqc-lab"

CARGO="${CARGO:-}"
if [[ -z "$CARGO" ]]; then
  if command -v cargo >/dev/null 2>&1; then
    CARGO="cargo"
  elif [[ -x "$HOME/.cargo/bin/cargo" ]]; then
    CARGO="$HOME/.cargo/bin/cargo"
  fi
fi

if [[ -z "$CARGO" ]]; then
  echo "cargo not found; install Rust to run the Wasm tests" >&2
  exit 1
fi

"$CARGO" test --quiet
