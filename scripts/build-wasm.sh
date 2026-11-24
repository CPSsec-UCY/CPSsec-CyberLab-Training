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

if [[ -n "$CARGO" ]]; then
  echo "Building pqc-lab for wasm32-unknown-unknown with $CARGO"
  "$CARGO" build --release --target wasm32-unknown-unknown
  mkdir -p "$ROOT/public/wasm"
  cp target/wasm32-unknown-unknown/release/pqc_lab.wasm "$ROOT/public/wasm/pqc_lab.wasm"
  echo "Wrote public/wasm/pqc_lab.wasm ($(wc -c < "$ROOT/public/wasm/pqc_lab.wasm") bytes)"
else
  if [[ -f "$ROOT/public/wasm/pqc_lab.wasm" ]]; then
    echo "cargo not found; keeping the checked-in public/wasm/pqc_lab.wasm"
  else
    echo "cargo not found and no checked-in Wasm artifact is available" >&2
    exit 1
  fi
fi
