# Z.ai-Dense-graph — Migration & Integration Plan

> Status: **DRAFT v1.0 — 2026-06-25**
> Author: Super Z (after forking Agent-Qube → Z.ai-Dense-graph)
> Owner decision required before executing phases marked `[DECISION]`

---

## 0. What we have right now

### 0.1 Z.ai-Dense-graph (current state after `fe1ba66`)

```
Z.ai-Dense-graph/
├── .superpowers-zai/        ← submodule @ 9391dc1 (Superpowers-Z.ai v5.1.0-zai.1)
├── anti-hallucination-guard/ ← submodule (inherited from Agent-Qube)
├── cascade-guard/           ← submodule (inherited from Agent-Qube)
├── skills/                  ← 18 installed Superpowers + 50+ Agent-Qube skills
├── src/                     ← Next.js 16 app (FSD-structured)
├── prisma/schema.prisma     ← Agent / Task / Formula models
├── .agent-rules.md          ← Agent-Qube's old rules (16 KB)
└── package.json             ← "agent-qube" v0.3.0
```

### 0.2 Skills inventory (all locations)

| Location | Count | Purpose | Tracking |
|---|---|---|---|
| `Z.ai-Dense-graph/skills/` (committed) | ~70 | Agent-Qube's bundled skills (ASR, LLM, charts, docx, etc.) | Git-tracked |
| `Z.ai-Dense-graph/skills/sp-*` | 14 | Superpowers w/ sp prefix | gitignored (installed from submodule) |
| `Z.ai-Dense-graph/skills/zai-*` | 4 | Native Z.ai skills | gitignored (installed from submodule) |
| `Z-ai-platform/skills/skills/` | 36 | Z-ai-platform skill repo (separate GitHub repo) | Submodule of Z-ai-platform |
| `/home/z/my-project/skills/` | 65 | Sandbox runtime skills | Not in any repo |

### 0.3 Existing Agent-Qube architecture (what we inherit)

- **Frontend**: Next.js 16 + React 19 + Tailwind 4 + shadcn/ui (New York)
- **Viz**: React Flow (`@xyflow/react`) + Dagre + Recharts + Framer Motion
- **State**: Zustand (client) + TanStack Query (server)
- **Realtime**: Socket.IO on port 3003
- **DB**: Prisma + SQLite (models: `Agent`, `Task`, `Formula`)
- **AI**: `z-ai-web-dev-sdk` already wired (`/api/interpret-prompt`, `/api/workflows/execute-llm`)
- **Domain**: 26 agents, 8 role groups, 5 hierarchy layers, 6 edge types, 20 cognitive formulas
- **FSD structure**: `src/features/{hierarchy,prompt-studio,dashboard,workflows,layout}` + `src/shared/{config,hooks,lib,ui}`

### 0.4 Z-ai-platform "Brain Center" (what we need to integrate)

| Module | GitHub repo | Role | Priority |
|---|---|---|---|
| `standards/` | `stsgs1980/Z-ai-standards` | 19 STD-* contracts + 2 verifiers | 1 (highest) |
| `guard/` | `stsgs1980/Z-ai-guard` | 17 RULE + 4 PROC + 6 TOOL (M003+M004 complete) | 1 |
| `skills/` | `stsgs1980/Z-ai-skills` | 36 Z-ai-platform skills | 2 |
| `AGENT_RULES.md` | (lives in platform root) | Single orchestration entry | 1 |

---

## 1. Decision points BEFORE we start

These need your call. I have recommendations, but you decide.

### 1.1 Inherited submodules (anti-hallucination-guard, cascade-guard)

**Recommendation**: KEEP `anti-hallucination-guard`, REMOVE `cascade-guard`.

- `anti-hallucination-guard` is referenced by Superpowers' `zai-verify-before-claim` skill (they're complementary). Keep.
- `cascade-guard` was Agent-Qube's parallel guard system. We have `Z-ai-guard` now which is strictly better (17 RULE + 4 PROC + 6 TOOL). Remove to avoid duplication.

**`[DECISION 1.1]`** Keep both / Keep only AHG / Remove both?

### 1.2 Skill deduplication strategy

`Z.ai-Dense-graph/skills/` has ~70 Agent-Qube skills committed (ASR, LLM, charts, docx, pptx, xlsx, pdf, design, fullstack-dev, etc.). These overlap with:
- Sandbox `/home/z/my-project/skills/` (65 skills, runtime-loaded)
- `Z-ai-skills` repo (36 skills, our managed set)

**Recommendation**: Move committed Agent-Qube skills to a separate `legacy-skills/` directory with a deprecation README, gitignore them, and let sandbox skills handle runtime.

**`[DECISION 1.2]`** Keep as-is / Move to legacy-skills/ / Delete entirely?

### 1.3 `.agent-rules.md` vs `AGENT_RULES.md`

Agent-Qube has `.agent-rules.md` (16 KB, 10 sections, Agent-Qube-specific). Z-ai-platform has `AGENT_RULES.md` (8 KB, 10 sections, brain-center-orchestrator).

**Recommendation**: Replace `.agent-rules.md` with `AGENT_RULES.md` from Z-ai-platform. Keep Agent-Qube's content as `docs/legacy/agent-qube-rules.md` for reference.

**`[DECISION 1.3]`** Replace / Merge / Keep both?

### 1.4 Package identity

`package.json` says `name: "agent-qube"`, `version: "0.3.0"`.

**Recommendation**: Rename to `z-ai-dense-graph`, version bump to `0.4.0` (first fork version), keep Agent-Qube as `description` reference.

**`[DECISION 1.4]`** Rename to `z-ai-dense-graph` / Keep `agent-qube` / Other?

### 1.5 Database migration

Agent-Qube's `prisma/schema.prisma` defines `Agent` (26 agents) / `Task` / `Formula` models. These are domain models for the agent dashboard, NOT for Z-ai-platform's ID-graph (60 IDs / 113 edges).

**Recommendation**: Add new Prisma models for ID-graph:
- `Standard` (id, repo, version, status)
- `Rule` (id, level, owning_standard)
- `Procedure` (id, implements_rule, calls_tools)
- `Tool` (id, file_path)
- `Skill` (id, version, contract_path)
- `Edge` (source_id, target_id, type: Related | Aligned_with)

Keep `Agent` / `Task` / `Formula` for the dashboard domain. Two separate aggregates, no FK between them.

**`[DECISION 1.5]`** Add ID-graph models / Keep separate / Other approach?

---

## 2. Phase plan (5 phases, ~2-3 hours total if you approve all)

### Phase A — Foundation: 4 Z-ai submodules (15 min, no decision)

**Goal**: Bring Z-ai-platform's brain center into Z.ai-Dense-graph.

**Steps**:
1. `git submodule add https://github.com/stsgs1980/Z-ai-standards.git standards`
2. `git submodule add https://github.com/stsgs1980/Z-ai-guard.git guard`
3. `git submodule add https://github.com/stsgs1980/Z-ai-skills.git zai-skills`
4. Copy `AGENT_RULES.md` from `Z-ai-platform/AGENT_RULES.md` to Z.ai-Dense-graph root
5. Add `bootstrap.sh` (adapted from Z-ai-platform) that runs:
   - `git submodule update --init --recursive`
   - `bash .superpowers-zai/install-zai.sh`
   - `node standards/scripts/verify-standards.js` (warn-only)
   - `node standards/scripts/verify-id-graph.js` (warn-only)
   - `cat AGENT_RULES.md` to stdout
6. Add `.githooks/pre-commit` adapted from Z-ai-platform (6 phases)
7. Update `.gitmodules` to use clean URLs (no tokens)
8. Commit + push

**After Phase A**: Z.ai-Dense-graph has 6 submodules (3 inherited + 3 new), full brain-center access.

### Phase B — Cleanup: remove Agent-Qube-specific cruft (15 min, depends on §1.1-1.4)

**Goal**: Make this repo OURS, not a copy of Agent-Qube.

**Steps** (assuming you approve all recommendations in §1):
1. `git rm cascade-guard` (and remove from .gitmodules)
2. Move `skills/{ASR,LLM,TTS,VLM,docx,pptx,xlsx,pdf,...}` → `legacy-skills/`
3. Add `legacy-skills/` to `.gitignore`
4. Write `legacy-skills/README.md` explaining why they're here
5. `git mv .agent-rules.md docs/legacy/agent-qube-rules.md`
6. Copy `AGENT_RULES.md` from Z-ai-platform → root
7. Update `package.json`: `name: "z-ai-dense-graph"`, `version: "0.4.0"`, `description: "..."`
8. Update `README.md`: rewrite to describe Z.ai-Dense-graph vision (not Agent-Qube)
9. Commit + push

**After Phase B**: Repo is clean, identity is Z.ai-Dense-graph.

### Phase C — Data: ID-graph seed (30 min, depends on §1.5)

**Goal**: Populate the database with the 60 IDs + 113 edges from `Dense-graph/data/id-graph-full.json`.

**Steps**:
1. Add Prisma models for ID-graph (see §1.5 recommendation)
2. `prisma migrate dev --name add-id-graph-models`
3. Write `scripts/seed-id-graph.ts` that:
   - Reads `standards/standards/META-001-id-registry.md` (authoritative source)
   - Reads `guard/registry.json` (auto-generated, 27 IDs)
   - Reads `zai-skills/INDEX.md` (ZAI-* skills)
   - Reads edges from each `Related:` / `Aligned_with:` line in source files
   - Upserts into DB
4. Add `npm run seed:id-graph` script
5. Run it. Verify counts: 60 IDs, 113 edges.
6. Commit + push

**After Phase C**: Database has live ID-graph. Dashboard can render it.

### Phase D — Visualization: ID-graph in dashboard (60 min, the real work)

**Goal**: Replace Agent-Qube's agent-hierarchy view with ID-graph hierarchy view. **Keep Agent-Qube's React Flow infrastructure**, swap data source.

**Steps**:
1. New feature module: `src/features/id-graph/`
   - `lib/` — fetch from `/api/id-graph`, BFS path search (port from `Dense-graph/examples/hierarchy-live.html`)
   - `components/` — `IdGraphCanvas`, `IdGraphSidebar`, `IdGraphDetailPanel`, `IdGraphKpiStrip`
2. New API routes:
   - `GET /api/id-graph` — returns `{ nodes: [...], edges: [...], summary: {...} }`
   - `GET /api/id-graph/[id]` — returns single ID + in/out edges
   - `GET /api/id-graph/search?from=...&to=...` — returns BFS path
3. Three layout modes (port from `hierarchy-live.html`):
   - Flat (force simulation)
   - Clustered (4 repo clusters with gravity)
   - Radial (concentric rings by in-degree)
4. Apply P-MAS design system (black #000000 + cyan #06B6D4) — already in `tailwind.config.ts`
5. KPI strip: 60 IDs / 113 edges / 4 repos / isolated / top hub
6. Sidebar: tree of 4 modules → 60 individual IDs (expandable)
7. Detail panel: per-ID metadata + clickable in/out edges + BFS path search form
8. Add route: `app/id-graph/page.tsx`
9. Add nav entry in dashboard sidebar
10. Commit + push

**After Phase D**: User can navigate to `/id-graph` and see live ID-graph visualization with 3 layout modes, BFS search, per-ID detail. **This is the MVP.**

### Phase E — Enforcement: pre-commit + CI (30 min)

**Goal**: Make sure new code/standards/skills changes can't break the ID-graph.

**Steps**:
1. Copy `.githooks/pre-commit` from Z-ai-platform (6 phases including COCHANGE-003 + LINECOUNT-004)
2. Update `install-hooks.sh` for new repo
3. Add GitHub Actions workflow `.github/workflows/verify.yml`:
   - Trigger: push + PR to main
   - Steps: checkout (with submodules), setup-node, `node standards/scripts/verify-standards.js`, `node standards/scripts/verify-id-graph.js`, `node standards/scripts/verify-skills.js --strict`
4. Add `bash guard/tools/verify-docs.sh` as final CI step
5. Commit + push

**After Phase E**: Repo has same enforcement as Z-ai-platform. Commits that break invariants are blocked locally + in CI.

---

## 3. What stays from Agent-Qube (no changes)

- `src/features/hierarchy/` — keep as-is, this becomes the "Agent Qube" view (legacy dashboard)
- `src/features/prompt-studio/` — keep, useful for prompt engineering
- `src/features/workflows/` — keep, LLM workflow execution
- `src/features/dashboard/` — keep, main shell
- 26 agents / 8 role groups / 5 layers / 6 edge types / 20 cognitive formulas — keep all domain data
- `prisma/schema.prisma` existing models (`Agent`, `Task`, `Formula`) — keep
- Socket.IO realtime — keep
- z-ai-web-dev-sdk integration — keep

**Insight**: Agent-Qube's agent hierarchy and Z-ai's ID-graph are **two different graphs**. They can coexist as separate views in the same Next.js app:
- `/` → dashboard (overview)
- `/agents` → Agent-Qube hierarchy (26 agents)
- `/id-graph` → Z-ai ID-graph (60 standards/rules/tools/skills)
- `/workflows` → workflow execution
- `/prompt-studio` → prompt engineering

---

## 4. Sequencing summary

```
Phase A (15min) — Foundation: 3 new submodules + AGENT_RULES.md + bootstrap.sh + hooks
   ↓
Phase B (15min) — Cleanup: remove cascade-guard, move legacy skills, rename package
   ↓
Phase C (30min) — Data: Prisma models for ID-graph + seed script
   ↓
Phase D (60min) — Viz: ID-graph view in dashboard (the MVP)
   ↓
Phase E (30min) — Enforcement: pre-commit + CI workflow
```

**Total**: ~2.5 hours of focused work, all phases executable without further decisions IF you approve §1.1-1.5 recommendations.

---

## 5. What I need from you

Just answer §1.1 through §1.5. Either:
- "Approve all recommendations" → I execute Phase A → B → C → D → E in sequence, push after each.
- "Approve with exceptions: 1.X = ... , 1.Y = ..." → I adjust.
- "Let me think" → I wait.

After §1 is decided, no more questions until Phase E is done. I'll push after each phase so you can review on GitHub between phases.

---

## 6. What to look at on GitHub right now

**https://github.com/stsgs1980/Z.ai-Dense-graph** — current state after `fe1ba66`:
- 33 stale skill dirs removed (14 sp-* + 14 bare + 5 zai-*)
- `.superpowers-zai/` submodule added (clean URL, no token)
- `skills/sp-*` and `skills/zai-*` now gitignored (installed from submodule)
- 18 fresh Superpowers skills installed via `install-zai.sh`

Compare with:
- **https://github.com/stsgs1980/Agent-Qube** — original (untouched)
- **https://github.com/stsgs1980/Z-ai-platform** — brain center source (where AGENT_RULES.md + submodules come from)
- **https://github.com/stsgs1980/Superpowers-Z.ai** — Superpowers source (now our submodule)

Open Z.ai-Dense-graph on GitHub, click on `.superpowers-zai` — you should see the submodule pinning to commit `9391dc1`. Click on `skills/` — you should NOT see any `sp-*` or `zai-*` dirs (they're gitignored).

---

## 7. Execution log (2026-06-25)

All 5 phases executed end-to-end. Commits on `main`:

| Phase | Commit | What landed |
|---|---|---|
| A | `d023939` | 3 new submodules (standards/guard/zai-skills) + AGENT_RULES.md + bootstrap.sh + .githooks |
| B | `5f34061` | Removed cascade-guard, deleted 66 sandbox-duplicate skill dirs (1146→10 files), renamed package to z-ai-dense-graph@0.4.0, moved .agent-rules.md to docs/legacy/ |
| C | `8069c48` | Prisma: IdNode + IdEdge + IdGraphSnapshot models + migration SQL + seed script + 60 IDs / 113 edges seeded + snapshot recorded |
| D | `0195fc4` | src/features/id-graph/ (5 components + 2 lib files) + 3 API routes + /id-graph page + dashboard header button + 3 layout modes + BFS search |
| E | `596ae88` | CI workflow (verify + build jobs) + pre-commit Phase 3 demoted to SOFT (Z.ai-Dense-graph has no skills/skills/) |

**Total: 5 commits, ~2.5h work, no decisions needed beyond initial §1 approval.**

### What works now

- Visit `/id-graph` on the dev server → see live ID-graph with 60 nodes + 113 edges
- Toggle 3 layouts: Flat (Dagre LR), Clustered (3 repo clusters), Radial (concentric rings)
- Click any node → detail panel on right with metadata + in/out edges
- Click neighbor in detail panel → navigates to that ID
- BFS path search: pick target from dropdown, click Go → path highlights on canvas
- KPI strip shows: 61 IDs / 114 edges / 19 STD / 17 RULE / 4 PROC / 6 TOOL / 25 ZAI / top hub / isolated
- Pre-commit hook enforces 6 phases locally (HARD on V01-V11 + G01-G15, SOFT on rest)
- CI runs same verifiers + build on every push/PR

### What's deferred (Phase F+)

- HARD CI enforcement (currently SOFT until pre-existing TS errors cleaned)
- Realtime ID-graph updates via WebSocket (currently static snapshot from seed)
- Edit ID metadata from UI (currently read-only)
- ~~Add 24 ZAI-* skill nodes (currently only 19 STD + 17 RULE = 36; seed pulls from id-graph-full.json which only has 60)~~ **DONE 2026-06-25**: id-graph-full.json already had 24 ZAI-* nodes; added the missing 25th (ZAI-STS-008 / skill-creator, whose SKILL.md frontmatter was missing the `id:` field, recovered from INDEX.md catalog override). Graph now has 61 nodes / 114 edges / 25 ZAI skills. See commit `feat(id-graph): add ZAI-STS-008 (skill-creator) — 25th ZAI node`.
- CLI terminal (Phase 2 of original architecture — deferred until brain center proven)
