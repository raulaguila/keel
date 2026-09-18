#!/usr/bin/env bash
# Install Keel into the current project from GitHub (no local clone needed).
# Usage (from your project root):
#   curl -fsSL https://raw.githubusercontent.com/raulaguila/keel/master/install.sh | bash -s -- --providers=cursor
#   curl -fsSL …/install.sh | bash -s -- --providers=cursor,cline --no-hooks
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "keel install: node is required (v20+)" >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "keel install: curl is required" >&2
  exit 1
fi
if ! command -v tar >/dev/null 2>&1; then
  echo "keel install: tar is required" >&2
  exit 1
fi

REPO="${KEEL_REPO:-raulaguila/keel}"
REF="${KEEL_REF:-master}"
PROJECT_ROOT="${KEEL_PROJECT:-$PWD}"

TMP="$(mktemp -d "${TMPDIR:-/tmp}/keel-install.XXXXXX")"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

ARCHIVE_URL="https://github.com/${REPO}/archive/refs/heads/${REF}.tar.gz"
# Tags: KEEL_REF=v0.4.2 → archive/refs/tags/…
if [[ "$REF" == v* ]] || [[ "$REF" =~ ^[0-9] ]]; then
  ARCHIVE_URL="https://github.com/${REPO}/archive/refs/tags/${REF}.tar.gz"
fi

echo "Fetching ${REPO}@${REF}…"
curl -fsSL "$ARCHIVE_URL" | tar -xz -C "$TMP"
shopt -s nullglob
dirs=("$TMP"/*)
SRC="${dirs[0]:-}"
if [[ -z "$SRC" || ! -d "$SRC" || ! -f "$SRC/cli/bin/keel.js" ]]; then
  echo "keel install: unexpected archive layout" >&2
  exit 1
fi

cd "$PROJECT_ROOT"
node "$SRC/cli/bin/keel.js" install "$@"
