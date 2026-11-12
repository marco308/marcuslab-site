#!/bin/sh
# Copies the current brand files into the marcuslab-brand agent skill, so agents working in other
# repos get the same tokens, logo files and guidelines. Run after `python3 brand/tools/build.py`.
#   brand/tools/sync-skill.sh [path-to-skill]
set -e
BRAND="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="${1:-$HOME/Documents/GitHub/agent-skills/marcuslab-brand}"
mkdir -p "$SKILL/assets/logo" "$SKILL/references"
cp "$BRAND/tokens/marcuslab.tokens.json" "$BRAND/tokens/tokens.css" "$SKILL/assets/"
cp "$BRAND"/logo/svg/*.svg "$SKILL/assets/logo/"
cp "$BRAND/README.md" "$SKILL/references/design-language.md"
cp "$BRAND/tokens/contrast.md" "$SKILL/references/contrast.md"
echo "Synced brand files to $SKILL"
