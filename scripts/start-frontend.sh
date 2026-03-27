#!/usr/bin/env bash
# Standalone frontend launcher.
# Override any variable via environment before calling this script.
#
#   MODE=production API_URL=https://api.mythic.ai ./scripts/start-frontend.sh
#
# Modes:
#   development (default) — Vite dev server with hot-reload
#   production            — Build static assets + serve with `vite preview`
#
# Exit code follows the underlying process so systemd Restart= works correctly.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MODE="${MODE:-development}"
FE_HOST="${FE_HOST:-0.0.0.0}"
FE_PORT="${FE_PORT:-3000}"

# The API URL that the browser will use to reach the backend.
export VITE_API_URL="${API_URL:-http://localhost:8000}"

# Resolve node/npm — prefer nix store, fall back to PATH
if command -v node &>/dev/null; then
  NODE_BIN="node"
  NPM_BIN="npm"
else
  # NixOS: node may not be on PATH
  NIX_NODE="$(find /nix/store -maxdepth 2 -name node -type f 2>/dev/null | head -1)"
  if [[ -n "${NIX_NODE:-}" ]]; then
    NODE_BIN="$NIX_NODE"
    NPM_BIN="$(dirname "$NIX_NODE")/../lib/node_modules/npm/bin/npm-cli.js"
    if [[ ! -f "$NPM_BIN" ]]; then
      NPM_BIN="$(dirname "$NIX_NODE")/npm"
    fi
  else
    echo "[frontend] ERROR: node not found. Install Node.js or enter a nix shell." >&2
    exit 1
  fi
fi

echo "[frontend] node: $("$NODE_BIN" --version)"

# Install dependencies if node_modules is missing or stale
if [[ ! -d node_modules ]] || [[ package.json -nt node_modules/.package-lock.json ]]; then
  echo "[frontend] Installing dependencies..."
  "$NODE_BIN" "$NPM_BIN" install --legacy-peer-deps
fi

if [[ "$MODE" == "production" ]]; then
  echo "[frontend] Building for production (VITE_API_URL=${VITE_API_URL})..."
  "$NODE_BIN" "$NPM_BIN" run build

  echo "[frontend] Serving production build on ${FE_HOST}:${FE_PORT}"
  exec "$NODE_BIN" node_modules/.bin/vite preview \
    --host "$FE_HOST" \
    --port "$FE_PORT"
else
  echo "[frontend] Starting dev server on ${FE_HOST}:${FE_PORT} (VITE_API_URL=${VITE_API_URL})"
  exec "$NODE_BIN" node_modules/.bin/vite \
    --host "$FE_HOST" \
    --port "$FE_PORT"
fi
