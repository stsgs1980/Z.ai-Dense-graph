# Agent Qube — Working Rules for AI Agents

Rules verified against the actual codebase (2026-06-23). Follow these strictly.

---

## 1. Onboarding Protocol

When entering a project (new chat, session restart, context loss), complete the onboarding protocol before starting any work:

1. Read `.agent-rules.md` (this file)
2. Read `PROJECT_CONFIG.md` (project-specific settings) -- if exists
3. Read `worklog.md` (previous session history)
4. Check git state: `git log --oneline -10` and `git status`
5. Verify project state per `PROJECT_CONFIG.md` (dev server, paths)
6. Scan project structure
7. Report current state to user

See `docs/instructions/onboarding-protocol.md` for full details.
NEVER start coding before completing Steps 1-3.

## 2. Language Rule

Always respond in the user's language. If the user writes in Russian, respond in Russian. If in English, respond in English. Never switch languages without explicit request.

- Code, file paths, terminal commands, git commit messages — always English
- Chat messages, explanations, worklog — match user's language
- Before each response verify: "Am I writing in the same language as the user?"

## 3. Git Workflow Rules

### 3.1 Backup Before Rewrite

Before any git operation that rewrites history (rebase, merge, pull, reset --hard):

1. `git stash push -m "pre-op-backup"`
2. `cp -r src/ /tmp/src-backup/`
3. `git log --oneline -20 > /tmp/git-log-backup.txt`

### 3.2 Force Push Over Rebase

When `git push` is rejected (diverged branches):
- `git push --force-with-lease origin main` — CORRECT
- `git push --force origin main` — AVOID (overrides remote without safety check)
- `git pull --rebase` — FORBIDDEN (blocks sandbox environment on conflict)

### 3.3 Never Pull After Remote URL Change

After `git remote set-url origin <url>`:
- `git push --force-with-lease origin main` — CORRECT
- `git push --force origin main` — AVOID (no safety check)
- `git pull` — FORBIDDEN (creates unnecessary conflicts)

### 3.4 No Panic Diagnostics

Before telling the user data is lost, check ALL 5 paths:

1. `ls src/app/` — do files exist?
2. `ls .git/rebase-merge/` — is rebase paused?
3. `git reflog` — are commits referenced?
4. `ls /tmp/src-backup-*/` — were backups created?
5. `git fsck --lost-found` — dangling objects?

NEVER say "permanently lost" until all 5 checks are exhausted.

### 3.5 Log Everything

After every git operation, log to `worklog.md`: operation, hash before/after, result.

## 4. ESLint Flat Config Gotchas

### 4.1 Inline plugin: use `context.report()`, NOT `this.report()`

In ESLint flat config (`eslint.config.mjs`), custom inline plugin rules receive a
`context` argument. Always use `context.report()`. Using `this.report()` will crash
at runtime with "is not a function".

```js
// CORRECT
create(context) {
  return {
    Program() {
      context.report({ loc: { line: 1, column: 0 }, message: '...' })
    },
  }
}

// WRONG — crashes
create() {
  return {
    Program() {
      this.report({ message: '...' })  // TypeError
    },
  }
}
```

### 4.2 `max-statements-per-line: { max: 1 }` is too strict

`const x = 1, y = 2` is idiomatic JS. Use `max: 2`.

### 4.3 shadcn/ui files must be exempted from size rules

shadcn/ui generates large files (e.g. `sidebar.tsx` ~500 lines). Always have an
explicit exemption block BEFORE stricter per-directory overrides:

```js
// shadcn exemption FIRST
{ files: ["src/components/ui/**"], rules: { "max-lines": "off", "max-lines-per-function": "off" } },
// stricter app/components overrides AFTER (with ignores: ["src/components/ui/**"])
```

Order matters — later blocks override earlier ones for matching files.

### 4.4 Custom plugin registration

Import local plugin via `createRequire`:
```js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const stsgsPlugin = require("./packages/eslint-plugin/dist/index.js").default;
```
Then register: `plugins: { stsgs: stsgsPlugin }`.

### 4.5 `readFileSync` in eslint.config.mjs is fine

ESLint config runs at lint time (Node.js), not in the browser. Using `fs.readFileSync`
to read `package.json` and `version.ts` for the version-check rule is correct.

## 5. Anti-Monolith Thresholds

Enforced via built-in ESLint rules + custom `eslint-plugin-stsgs` (`packages/eslint-plugin/`).

### 5.1 ESLint rules

| Rule | Global | app/ & components/ |
|------|--------|---------------------|
| `max-lines` | 250 | 200 |
| `max-lines-per-function` | 50 | 50 |
| `complexity` | 15 | 15 |
| `max-depth` | 4 | 4 |
| `max-params` | 5 | 5 |
| `max-nested-callbacks` | 3 | 3 |

All set to `"warn"` (not error).

### 5.2 Custom plugin rules

| Rule | Severity | Threshold |
|------|----------|-----------|
| `stsgs/max-use-state` | warn | max 2 useState per component |
| `stsgs/no-cross-layer-imports` | warn | forbid layer boundary violations |
| `stsgs/no-unicode` | warn | forbid emoji in source code |

### 5.3 Layer boundaries (enforced by `no-cross-layer-imports`)

```
components/ui/  →  only external libs (base layer)
data/           →  self-contained, no src/ deps
lib/            →  no components/, hooks/, app/
hooks/          →  no components/, app/ (only lib/, data/)
components/*/   →  can import from ui/, lib/, data/, hooks/
app/            →  can import from everything
```

### 5.4 Cross-test results (2026-06-24)

**Layer violations (warn — needs refactor):**
- `src/components/ui/sidebar.tsx` — ui imports from hooks
- `src/components/ui/toaster.tsx` — ui imports from hooks
- `src/hooks/use-agent-edit-form.ts` — hooks imports from components
- `src/hooks/use-execution-animation.ts` — hooks imports from components
- `src/hooks/use-hierarchy-data.ts` — hooks imports from components
- `src/hooks/use-hierarchy-data-helpers.ts` — hooks imports from components
- `src/hooks/use-hierarchy-state.ts` — hooks imports from components
- `src/hooks/use-hierarchy-state-helpers.ts` — hooks imports from components
- `src/hooks/use-workflow-create.ts` — hooks imports from components
- `src/hooks/use-workflow-data.ts` — hooks imports from components
- `src/hooks/use-workflow-data-helpers.ts` — hooks imports from components
- `src/hooks/use-workflow-state.ts` — hooks imports from components

**Files exceeding max-lines:**
- `prompt-studio-parts.tsx` — 203 (limit 200)
- `execution-result.tsx` — 280 (limit 200)
- `presets.ts` — 257 (limit 250)
- `cognitive-formulas.ts` — 265 (limit 250)
- `resilience.ts` — 294 (limit 250)
- `scoring.ts` — 300 (limit 250)
- `workflow-execution.ts` — 253 (limit 250)

**Functions exceeding 50 lines:**
- `useExecutionHistory` (54), `useHierarchyState` (53), `usePromptAnalysis` (59)
- `withTimeout` in `resilience.ts` (51), `timeout-utilities.ts` (51)

## 6. Decomposition Safety Procedure

When splitting a monolith file, follow this checklist:

1. **Read the original file completely** before extracting anything
2. **Extract data/constants first** — pure data with no imports (safest)
3. **Extract pure helpers second** — functions that only depend on their arguments
4. **Create a barrel re-export file** — the original filename becomes a thin re-export
5. **Verify every import** — after refactoring, grep for all consumers of the old exports
6. **Re-export everything that was public** — do NOT silently drop exports
7. **Run `next build`** — the only reliable verification. `tsc --noEmit` misses some issues.

### 6.1 Barrel file pattern

```ts
// techniques.ts (barrel)
import { clarityTechniques } from './techniques-clarity'
import { advancedTechniques } from './techniques-advanced'

const techniques = [...clarityTechniques, ...advancedTechniques]

export function getTechniques(filter?) { /* ... */ }
export { techniques }
```

### 6.2 Route handler decomposition

API routes should be thin handlers. Extract all logic to `src/lib/`:
```
src/app/api/stats/route.ts        → 15 lines (handler only)
src/lib/stats-computations.ts     → ~200 lines (DB queries + transforms)
src/lib/stats-constants.ts        → ~90 lines  (pure config data)
src/lib/stats-heatmap.ts          → ~100 lines (pure computation)
```

### 6.3 File naming for decomposed modules

When a hook or module needs splitting, use dash-suffix convention:
```
use-prompt-analysis.ts           → main hook
use-prompt-analysis-types.ts     → TypeScript types
use-prompt-analysis-mappings.ts  → mapping/transform functions
use-prompt-analysis-executor.ts  → side-effectful execution logic
```

## 7. Project Structure Conventions

### 7.1 Import patterns

- `@/lib/` — shared logic, utilities, constants
- `@/hooks/` — React hooks (can be split into `hook-name-types.ts`, `hook-name-mappings.ts`, etc.)
- `@/components/dashboard/` — dashboard-specific components
- `@/components/ui/` — shadcn/ui (exempt from size rules)
- `@/components/hierarchy/` — hierarchy visualization
- `@/data/` — static/mock data (`dashboard-constants.ts`)

### 7.2 Layers (FSD-style)

- `app/` — imports from `features/`, `sections/`, `shared/`
- `features/` — imports from `sections/`, `shared/` (NEVER `app/`)
- `sections/` — imports from `shared/` only (NEVER `features/` or `app/`)
- `shared/` — imports NOTHING from this project (only external libs)

## 8. Common Pitfalls

### 8.1 Do NOT silently drop re-exports during decomposition

When creating barrel files, grep for every export name before and after:
```bash
# Before: what do consumers import?
rg 'from.*instructions' src/ --type ts
# After: does the barrel export it?
rg 'export.*AI_RULES' src/lib/prompting/
```

### 8.2 Do NOT use `this` in ESLint flat config plugins

See rule 4.1. This is the #1 runtime crash cause.

### 8.3 `process` in version.ts needs guard

```ts
export const BUILD_TIME = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString().slice(0, 10))
  : ''
```

Without the `typeof process` guard, client-side rendering will crash.

### 8.4 No panic diagnostics

Before telling the user data is lost, check all 5 paths (see 3.4).

## 9. Code Standards

All standards live in `docs/standards/`. Apply Group B (governance) FIRST, then Group A (operational).

### 9.1 Unicode Policy v2.1

> File: `docs/standards/UNICODE_POLICY.md`
> Levels: [C] Critical (code, UI) + [W] Warning (docs) + [I] Info (prototypes)

Prohibits emoji and Unicode graphic characters in source code and UI text. Use SVG icons instead.

### 9.2 Frontend Development Standard

> File: `docs/standards/FRONTEND_STANDARD.md` | Level: [C] Critical

- File size: 200 lines max components, 250 global (enforced via ESLint `max-lines`)
- Function size: 50 lines max (enforced via ESLint `max-lines-per-function`)
- State: max 2 `useState` per component (enforced via `stsgs/max-use-state`)
- Architecture: Feature-Sliced Design (FSD), layer imports enforced via `stsgs/no-cross-layer-imports`
- No direct API calls in UI components
- No emoji in source code (enforced via `stsgs/no-unicode`)

### 9.3 Diagnostic Disclosure

Severity ladder for communicating problems:

| Certainty | Phrase |
|-----------|--------|
| File exists | "File X is present, Y lines" |
| Not found | "File X not found, checking alternatives..." |
| All checks exhausted | "File X not found after exhaustive search. Options: A, B, C" |
| All recovery failed | "File X could not be recovered. You may need to recreate it." |

Never jump to the last row without passing through all previous rows.

## 10. Planning Rule

For tasks that require more than 3 steps, write a plan in `worklog.md` BEFORE writing code.

- Tasks 1-3 steps: just do it, log after
- Tasks 4-10 steps: write a brief plan in worklog, then execute
- Tasks 10+ steps: write a detailed plan, show user for confirmation before starting

See `docs/instructions/writing-plans.md` for full details.

## 11. Environment Limitations

### 11.1 `@zai/select-element` is unavailable

This is a GitHub SSH patch package. In sandbox it cannot be installed.
When it appears in `layout.tsx` or similar:
- Comment out the import
- Comment out the JSX usage
- Add `// TODO: restore after @zai/select-element is available`

### 11.2 `npm version patch` is safe for versioning

The project uses single-source-of-truth versioning:
1. `src/lib/version.ts` — `APP_VERSION` constant (primary)
2. `src/components/ui/version-badge.tsx` — reads from `@/lib/version`
3. `package.json` — synced via ESLint `no-stale-version` rule

When bumping: change `APP_VERSION` in `version.ts` first, then `npm version patch`
to sync package.json. The ESLint rule will warn if they diverge.

### 11.3 Versioning workflow

```
1. Edit src/lib/version.ts → APP_VERSION = '0.x.y'
2. Run: npm version patch   (updates package.json + git tag)
3. Commit + push
```

## 12. Sandbox Z.ai

### 12.1 Environment constraints

- **Shared filesystem**: All chat sessions share the same filesystem.
- **Chat = Shell process**: Each chat session has its own shell process. When the
  chat ends, the shell process dies, but files on disk remain.
- **Process mortality**: Background processes (dev servers, watchers) die when the
  chat session ends or after ~5 minutes of inactivity. Use `disown` to maximize survival.
- **No cross-chat process sharing**: A process started in one chat cannot be
  controlled from another chat.
- **Recovery from git lockup**: If a previous chat left git in a blocked state
  (e.g., `needs merge`, `rebase in progress`), the ONLY safe recovery is:
  ```bash
  rm -rf .git/rebase-merge .git/rebase-apply
  git reset --hard HEAD
  ```

### 12.2 Dev Server Startup

```bash
pkill -f 'next dev' 2>/dev/null && sleep 1
cd /home/z/my-project && npx next dev -p 3000 </dev/null >/tmp/zdev.log 2>&1 & disown
sleep 6
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/
```

Key rules:
- Always use `disown` after backgrounding the server process
- Always use `npx next dev`, NOT `bun run dev` (bun wrapper is unstable)
- Always redirect output: `>/tmp/zdev.log 2>&1`
- Always close stdin: `</dev/null`
- Always use `127.0.0.1` for health checks (not `localhost` — IPv6 issues)
- Server lives ~5 min; watchdog should check every 5 min

## 13. Verification Checklist (before claiming "done")

- [ ] `npx next build` passes with 0 errors
- [ ] All exports that existed before decomposition still exist (grep verify)
- [ ] `src/lib/version.ts` APP_VERSION matches `package.json` version
- [ ] `@zai/select-element` is commented out if present
- [ ] No `this.report()` in `eslint.config.mjs` (only `context.report()`)
- [ ] `src/components/ui/**` is exempted from size rules
- [ ] ESLint `bun run lint` passes with expected warnings only

## 14. Cascade: Task Execution Discipline

> Rules for dependency-aware, priority-ordered task execution.
> Managed by `cascade-state.json` and `cascade-cli.sh`.

### C-1: Single source of truth

`cascade-state.json` is the only source of truth for task status.

### C-2: Start protocol

Before any work:
1. Read `cascade-state.json`
2. Run `./cascade-cli.sh next-task` to find the next available task
3. Confirm the task status is `ready`
4. If `blocked` — DO NOT touch it

### C-3: Task execution

**Start:** Read cascade-state.json → study title/AC/checks → write to worklog → run `./cascade-cli.sh start-task {id}`

**Work:** Implement → check anti_hallucination → check quality rules → commit per logical unit

**Complete:** Verify ALL acceptance criteria → run `./cascade-cli.sh complete-task {id}` → worklog → commit

### C-4: Forbidden

| # | Prohibition |
|---|-------------|
| 1 | Mark done without checking ALL acceptance criteria |
| 2 | Skip anti_hallucination checks |
| 3 | Start a task where any depends_on is not completed |
| 4 | Modify cascade-state.json without doing the work |
| 5 | Work out of priority order (skip P0 for P2) |
| 6 | Commit messages like "update", "fix", "wip" |

### C-5: Priority

| Priority | Meaning |
|----------|---------|
| P0 | Critical — never defer |
| P1 | Important — defer only after all P0 in phase |
| P2 | Nice to have — defer until P0/P1 done |

### C-6: CLI reference

```bash
./cascade-cli.sh next-task          # What should I work on next?
./cascade-cli.sh ready-tasks        # Show all ready tasks
./cascade-cli.sh start-task F0.2    # I'm starting this task
./cascade-cli.sh complete-task F0.2 # I finished this task
./cascade-cli.sh status             # Show overall progress
./cascade-cli.sh deps F3.4          # What does this task depend on?
./cascade-cli.sh critical-path      # Show the longest dependency chain
./cascade-cli.sh validate           # Check cascade-state.json integrity
```
