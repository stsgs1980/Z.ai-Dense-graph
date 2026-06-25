#!/usr/bin/env bash
# bootstrap.sh — Z.ai-Dense-graph session starter
#
# Runs once per session to bring the workspace online:
#   1. git submodule update --init --recursive
#   2. Install Superpowers skills (.superpowers-zai/install-zai.sh)
#   3. Run Z-ai verifiers (warn-only, never block)
#   4. Print AGENT_RULES.md to stdout (single entry point for agents)

set -uo pipefail

PLATFORM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PLATFORM_DIR"

echo "[bootstrap] Z.ai-Dense-graph bootstrap"
echo "[bootstrap] $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# --- Step 1: Submodules ---------------------------------------------------
echo "[bootstrap] Step 1/4: init + update submodules (recursive)"
if ! git submodule status --recursive 2>/dev/null | grep -q '^ '; then
  git submodule update --init --recursive
fi
echo "[bootstrap] OK: submodules ready"
echo ""

# --- Step 2: Install Superpowers skills -----------------------------------
echo "[bootstrap] Step 2/4: install Superpowers skills"
if [ -f .superpowers-zai/install-zai.sh ]; then
  bash .superpowers-zai/install-zai.sh 2>&1 | tail -5
else
  echo "[bootstrap] WARN: .superpowers-zai/install-zai.sh not found"
fi
echo ""

# --- Step 3: Run Z-ai verifiers (warn-only) -------------------------------
echo "[bootstrap] Step 3/4: Z-ai verifiers (warn-only)"
VS="standards/scripts/verify-standards.js"
VG="standards/scripts/verify-id-graph.js"
VD="guard/tools/verify-docs.sh"

if command -v node >/dev/null 2>&1; then
  [ -f "$VS" ] && { node "$VS" >/tmp/bs-vs.log 2>&1 && echo "[bootstrap] OK: verify-standards.js PASS" || { echo "[bootstrap] WARN: verify-standards.js issues (see /tmp/bs-vs.log)"; sed 's/^/  /' /tmp/bs-vs.log | head -10; }; }
  [ -f "$VG" ] && { node "$VG" >/tmp/bs-vg.log 2>&1 && echo "[bootstrap] OK: verify-id-graph.js PASS" || { echo "[bootstrap] WARN: verify-id-graph.js issues (see /tmp/bs-vg.log)"; sed 's/^/  /' /tmp/bs-vg.log | head -10; }; }
else
  echo "[bootstrap] WARN: node not in PATH, skipping JS verifiers"
fi

[ -f "$VD" ] && { bash "$VD" --skip-platform >/tmp/bs-vd.log 2>&1 && echo "[bootstrap] OK: verify-docs.sh PASS" || { echo "[bootstrap] WARN: verify-docs.sh issues"; sed 's/^/  /' /tmp/bs-vd.log | head -10; }; }
echo ""

# --- Step 4: Print AGENT_RULES.md (single entry point) --------------------
echo "[bootstrap] Step 4/4: AGENT_RULES.md (single entry point for agents)"
echo "[bootstrap] ---- AGENT_RULES.md ----"
cat AGENT_RULES.md 2>/dev/null || echo "[bootstrap] WARN: AGENT_RULES.md not found"
echo "[bootstrap] ---- end AGENT_RULES.md ----"
echo ""
echo "[bootstrap] DONE. Workspace ready."
