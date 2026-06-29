# Z.ai-Dense-graph

**Z.ai-Dense-graph** — Dense ID-graph visualization dashboard for the Z-ai ecosystem. Forked from [Agent-Qube](https://github.com/stsgs1980/Agent-Qube) v0.3.0 (26 AI agents, 8 role groups, 5 hierarchy layers).

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)


## What this is

Z.ai-Dense-graph visualizes the **Z-ai platform brain center** as a dense ID-graph:
- **60 IDs** across 4 modules (19 STD-* standards, 17 RULE-* rules, 6 TOOL-* tools, 24 ZAI-* skills + others)
- **113 edges** (Related + Aligned_with)
- **3 layout modes**: Flat (force), Clustered (by repo), Radial (by in-degree)
- **BFS shortest-path search** between any two IDs
- **Per-ID detail panel** with in/out edges, owning standard, related rules

It also inherits Agent-Qube's agent dashboard:
- 26 AI agents across 8 role groups (Strategy / Tactics / Control / Execution / Memory / Monitoring / Communication / Learning)
- 6 edge types (command / sync / twin / delegate / supervise / broadcast)
- 20 cognitive formulas (CoT, ToT, GoT, CoVe, ReAct, Reflexion, ReWOO, MoA, ...)
- LLM-powered workflow execution via z-ai-web-dev-sdk
- Real-time WebSocket updates

## Features

- 60 IDs across 4 modules (19 STD-* standards, 17 RULE-* rules, 6 TOOL-* tools, 24 ZAI-* skills + others)
- 113 edges (Related + Aligned_with)
- 3 layout modes: Flat (force), Clustered (by repo), Radial (by in-degree)
- BFS shortest-path search between any two IDs
- Per-ID detail panel with in/out edges, owning standard, related rules
- 26 AI agents across 8 role groups (Strategy / Tactics / Control / Execution / Memory / Monitoring / Communication / Learning)
- 6 edge types (command / sync / twin / delegate / supervise / broadcast)
- 20 cognitive formulas (CoT, ToT, GoT, CoVe, ReAct, Reflexion, ReWOO, MoA, ...)
- LLM-powered workflow execution via z-ai-web-dev-sdk
- Real-time WebSocket updates

## Tech Stack

- **Framework** - Next.js
- **Language** - TypeScript
- **Styling** - Tailwind CSS, CSS
- **Database** - Prisma, SQLite
- **Libraries** - shadcn/ui, Zustand, Framer Motion, React Flow, Recharts, Zod
- **Real-time** - Socket.IO
- **AI** - z-ai-web-dev-sdk
- **Tools** - React

## Getting Started

### Prerequisites

- Node.js 20+ or Bun

### Installation

```bash
git clone https://github.com/stsgs1980/Z.ai-Dense-graph.git
cd Z.ai-Dense-graph
bun install
```

### Run

```bash
bun run dev
```

## Architecture (4 layers)

| Layer | Component | Status |
|---|---|---|
| **L1 — UI** | This repo (Next.js 16 dashboard) | Active |
| **L2 — Control** | CLI terminal (planned Phase 2) | Deferred until brain center is proven |
| **L3 — Orchestration** | `AGENT_RULES.md` (single entry point) + `guard/` (17 RULE + 4 PROC + 6 TOOL) | Active |
| **L4 — Knowledge** | 3 submodules: `standards/` (19 STD), `guard/` (27 enforcement IDs), `zai-skills/` (36 ZAI skills) | Active |

## Submodules (6)

| Submodule | Source | Purpose |
|---|---|---|
| `standards/` | [Z-ai-standards](https://github.com/stsgs1980/Z-ai-standards) | 19 STD-* contracts + 2 verifiers |
| `guard/` | [Z-ai-guard](https://github.com/stsgs1980/Z-ai-guard) | 17 RULE + 4 PROC + 6 TOOL (M003+M004 complete) |
| `zai-skills/` | [Z-ai-skills](https://github.com/stsgs1980/Z-ai-skills) | 36 Z-ai-platform managed skills |
| `.superpowers-zai/` | [Superpowers-Z.ai](https://github.com/stsgs1980/Superpowers-Z.ai) | 18 methodology skills (brainstorming, TDD, debugging, code review) |
| `anti-hallucination-guard/` | [Anti-hallucination-guard](https://github.com/stsgs1980/Anti-hallucination-guard) | Hallucination prevention (complements zai-verify-before-claim) |

## Quick start

```bash
## Clone with all submodules
git clone --recurse-submodules https://github.com/stsgs1980/Z.ai-Dense-graph.git
cd Z.ai-Dense-graph

## One-shot setup (submodules + skills + verifiers + AGENT_RULES.md print)
bash bootstrap.sh

## Install git hooks (6-phase pre-commit)
bash install-hooks.sh

## Start dev server
bun install
bun run dev
```

## Documentation

- [`docs/MIGRATION-PLAN.md`](docs/MIGRATION-PLAN.md) — 5-phase migration from Agent-Qube fork to Z.ai-Dense-graph
- [`AGENT_RULES.md`](AGENT_RULES.md) — single orchestration entry point for agents (L3)
- [`docs/legacy/agent-qube-rules.md`](docs/legacy/agent-qube-rules.md) — Agent-Qube's original rules (preserved for reference)
- [`skills/README.md`](skills/README.md) — explains what's committed vs gitignored in `skills/`

## Tech stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite |
| Visualization | React Flow (`@xyflow/react`) + Dagre + Recharts |
| Animation | Framer Motion |
| State | Zustand (client) + TanStack Query (server) |
| Real-time | Socket.IO (WebSocket mini-service, port 3003) |
| AI Integration | z-ai-web-dev-sdk (chat completions, resilience) |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- Forked from [Agent-Qube](https://github.com/stsgs1980/Agent-Qube) v0.3.0
- Brain center from [Z-ai-platform](https://github.com/stsgs1980/Z-ai-platform) v2.6.0
- Methodology from [Superpowers](https://github.com/obra/superpowers) v5.1.0 (Z.ai-adapted fork)

---
Built with: Next.js + React + TypeScript + Tailwind CSS
