# Z.ai-Dense-graph skills/

This directory contains skills that are:
1. **NOT** installed from a submodule (those live in `.superpowers-zai/skills/` and are gitignored here)
2. **NOT** available in the sandbox runtime at `/home/z/my-project/skills/`
3. **Unique** to this repo — would be lost without being committed

## Current contents

| Skill | Origin | Status |
|---|---|---|
| `anti-monolith/` | Originally from Z-ai-platform `skills/skills/anti-monolith/` | Verify before Phase C — may need to be replaced by reference to `zai-skills/` submodule |
| `prompt-engineering/` | Originally from Agent-Qube's bundled set | Likely useful for prompt-studio feature |

## What was removed in Phase B (commit `B.x`)

- 64 sandbox-duplicate skill directories (ASR, LLM, TTS, VLM, charts, docx, pdf, pptx, xlsx, design, gaokao-*, dream-interpreter, get-fortune-analysis, mindfulness-meditation, etc.) — these are loaded from `/home/z/my-project/skills/` at runtime, no need to commit
- 2 garbage dirs: `skill-creator.sandbox-backup/`, `video-generator/` (duplicate of `video-generation/`)

Total files removed: 1146 -> ~10

## Where to find other skills

- **Sandbox runtime** (65 skills): `/home/z/my-project/skills/`
- **Superpowers** (18 skills, gitignored): `skills/sp-*`, `skills/zai-*` — installed via `bash .superpowers-zai/install-zai.sh`
- **Z-ai-platform managed** (36 skills): `zai-skills/` submodule
