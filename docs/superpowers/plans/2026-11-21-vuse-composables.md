# viti-ui composables with the `vUse` prefix: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** rename every viti-ui composable from `useX` to `vUseX` (file and exported function), publish it as viti-ui 3.0.0 and move the three apps to it.

**Architecture:** a mechanical refactor with no behavior change. viti-ui renames each `src/composables/useX.ts` (and its test) to `vUseX.ts` and its `useX` function to `vUseX`. The other exports in those files (`openContextMenu`, `withPlaceholder`, `LOOKS`, `initTheme`...) keep their names. The public path pattern `viti-ui/composables/*` doesn't change, but every concrete import path does, so it's a major version. Then each app changes its imports and pins `#v3.0.0`.

**Tech Stack:** Vue 3, TypeScript, Vitest 4, npm.

**Spec:** `C:\Users\byzth\Documents\AI\VitiChatWatcher\docs\superpowers\specs\2026-11-21-vitisminecraftapi-coordinates-design.md`, section «3b. viti-ui: composables con prefijo `vUse`». This is plan 1 of 5 for that spec.

## Global Constraints

- Only viti-ui composables are renamed. Each app's own composables (`useFileSort`, `useConsoleHistory`...) keep `use`.
- Renames (file → function):
  `useContextMenu` → `vUseContextMenu`, `useFillHeight` → `vUseFillHeight`, `useListDrag` → `vUseListDrag`, `useLook` → `vUseLook`, `useTableSort` → `vUseTableSort`, `useTheme` → `vUseTheme`.
- No behavior change. Tests only change their imports and the names they call.
- viti-ui version: `3.0.0` (major, per its `git-workflow` skill: an exported name and path change).
- Branches start from `develop` and their PRs target `develop`. Branch names: viti-ui `chore/vuse-composables`; apps `chore/viti-ui-v3`. Code commits use the conventional type `refactor`. `CLAUDE.md` and skill changes in VitiProject, VitiDiagnostics and minipcManager go on their `claude-config` branch. In viti-ui they go on the same work branch: that repo has no `claude-config`.
- The tag `v3.0.0` goes on viti-ui `main` once the user has merged it. Claude only creates it with the user's permission.
- No commit, push, PR or merge unless the user asks. When they do, use each repo's `git-workflow` skill. Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Historical docs (`docs/superpowers/plans|specs/*`, `.superpowers/sdd/*`) are **not** rewritten: they describe the past.

## Review Focus

1. A rename that's half done: an import of `../composables/useX` left in a viti-ui `.vue` file. `vue-tsc` and the naming test from Task 1 must catch it.
2. A missed app import: `npm run build` (which runs `vue-tsc`) must pass in every app. An exported name used only in templates or skills wouldn't show up in tests.
3. VitiProject and VitiDiagnostics jump from `v2.0.0` to `v3.0.0` and also pick up 2.1.0 (`VPaneSplitter`, additive). Their tests and build must stay green with no other change.
4. Docs pointing at old names (`useTableSort` in CLAUDE.md...; the `drag-reorder` skill is left for plan 4) after the change: a final `grep` per repo, Task 2 to 4.
5. `npm install` keeping the old version in `package-lock.json`: check that the lock resolves `v3.0.0`.

---

### Task 1: rename the composables in viti-ui

**Files:**
- Rename: `src/composables/{useContextMenu,useFillHeight,useListDrag,useLook,useTableSort,useTheme}.ts` and their `.test.ts` → `vUse…` (with `git mv`)
- Modify: `src/components/ContextMenu.vue`, `LookPicker.vue`, `ThemeToggle.vue`, `VItem.vue`, `VItemList.vue` (imports and calls)
- Modify: `package.json` (`"version": "3.0.0"`), `INVENTORY.md`, `README.md` (example `viti-ui/composables/useTableSort` → `vUseTableSort`), `CLAUDE.md` ("composables con prefijo `use`" → "`vUse`", the structure comment `useXxx` → `vUseXxx`, and the mechanics `useTableSort`/`useListDrag`)
- Create: `src/composables/naming.test.ts`

**Interfaces:**
- Produces: the public modules `viti-ui/composables/vUseContextMenu`, `vUseFillHeight`, `vUseListDrag`, `vUseLook`, `vUseTableSort` and `vUseTheme`, each exporting a `vUseX` function with the same signature as the old `useX`. The other exports are unchanged.

- [ ] **Step 1: write the naming test** in `src/composables/naming.test.ts`

```ts
import { describe, expect, it } from 'vitest'

const modules = import.meta.glob(['./*.ts', '!./*.test.ts'], { eager: true })

describe('composable naming', () => {
  it('every composable file starts with vUse', () => {
    const names = Object.keys(modules).map((path) => path.replace(/^\.\/|\.ts$/g, ''))
    expect(names.length).toBeGreaterThan(0)
    for (const name of names) expect(name).toMatch(/^vUse[A-Z]/)
  })

  it('every composable file exports a function with its own name', () => {
    for (const [path, mod] of Object.entries(modules)) {
      const name = path.replace(/^\.\/|\.ts$/g, '')
      expect(typeof (mod as Record<string, unknown>)[name]).toBe('function')
    }
  })
})
```

- [ ] **Step 2: run it to see it fail**

Run: `npx vitest run src/composables/naming.test.ts`
Expected: FAIL on `useContextMenu` (doesn't match `/^vUse[A-Z]/`).

- [ ] **Step 3: rename** files, functions, internal imports and callers (the list in Files). Only the `useX` names in Global Constraints; nothing else.

- [ ] **Step 4: update the docs** (`INVENTORY.md`, `README.md`, `CLAUDE.md`, as in Files), using viti-ui's `doc-review` skill. Check there are no leftovers:

Run: `grep -rnE "\buse(ContextMenu|FillHeight|ListDrag|Look|TableSort|Theme)\b" src INVENTORY.md README.md CLAUDE.md`
Expected: no output.

- [ ] **Step 5: verify**

Run: `npm run test && npm run lint && npm run typecheck`
Expected: all green, including `naming.test.ts`.

- [ ] **Step 6: commit** (only if the user asked), on `chore/vuse-composables`:
`refactor!: prefix every composable with vUse` (body: `BREAKING CHANGE: viti-ui/composables/useX is now viti-ui/composables/vUseX, and useX() is vUseX()`).

- [ ] **Step 7: publish** (each step only if the user asks): PR to `develop`, then the `develop` → `main` PR that the user merges, then the `v3.0.0` tag on `main` with permission. Tasks 2 to 4 need that tag.

### Task 2: minipcManager on viti-ui 3.0.0

**Files:**
- Modify: `frontend/package.json` (`"viti-ui": "github:Byzthr/viti-ui#v3.0.0"`) and `frontend/package-lock.json` (via `npm install`)
- Modify (imports and calls): `frontend/src/main.ts`, `components/SidebarMenu.vue`, `features/ficheros/ExplorerWindow.vue`, `features/ficheros/useFileActions.ts`, `features/ficheros/useFileSort.ts`, `features/minipc/FolderGuide.vue`, `features/minipc/SoftwareList.vue`, `features/minipc/TerminalPanel.vue`, `features/vitidb/DataTable.vue`
- Modify, on the `claude-config` branch: `CLAUDE.md` (`useTableSort` → `vUseTableSort`)

**Interfaces:**
- Consumes: the modules from Task 1.

- [ ] **Step 1:** `npm install github:Byzthr/viti-ui#v3.0.0` from `frontend/`. Check that `package-lock.json` resolves the commit of the `v3.0.0` tag.
- [ ] **Step 2: verify that it breaks:** `npm run build`. Expected: FAIL, `Cannot find module 'viti-ui/composables/useTableSort'` (or similar).
- [ ] **Step 3:** change imports and calls in the files listed. `useFileSort` keeps its name: it belongs to the app.
- [ ] **Step 4: verify:** `npm run test && npm run lint && npm run build`. Expected: green. Also
  `grep -rnE "viti-ui/composables/use|\buse(ContextMenu|FillHeight|ListDrag|Look|TableSort|Theme)\(" frontend/src` with no output.
- [ ] **Step 5:** `CLAUDE.md` on `claude-config`, with the `doc-review` skill.
- [ ] **Step 6: commit** (if the user asks), on `chore/viti-ui-v3`: `refactor: move to viti-ui 3.0.0 (vUse composables)`.

### Task 3: VitiProject on viti-ui 3.0.0

**Files:**
- Modify: `frontend/package.json` (`#v2.0.0` → `#v3.0.0`) and `package-lock.json`
- Modify (imports and calls): `frontend/src/main.ts`, `components/SidebarMenu.vue`, `features/calendar/dayMenu.ts`, `eventMenu.ts`, `HourSchedule.vue`, `list/DatesList.vue`, `month/MonthStrip.vue`, `year/YearStrip.vue`, `features/vitidb/DataTable.vue`, `features/wishlist/WishlistSection.vue`
- Modify, on `claude-config`: `CLAUDE.md` (`useTableSort`, `useListDrag` → `vUse…`). The `drag-reorder` skill is **not** touched: plan 4 deletes it (user's decision)

**Interfaces:**
- Consumes: the modules from Task 1.

- [ ] **Step 1:** `npm install github:Byzthr/viti-ui#v3.0.0` from `frontend/`.
- [ ] **Step 2: verify that it breaks:** `npm run build`. Expected: FAIL from a missing `viti-ui/composables/use…` module.
- [ ] **Step 3:** change imports and calls in the files listed.
- [ ] **Step 4: verify:** `npm run test && npm run lint && npm run build`. Expected: green, and the same `grep` as in Task 2 with no output. 2.1.0 only adds pieces: if something else breaks, stop and report it.
- [ ] **Step 5:** `CLAUDE.md` on `claude-config`, with `doc-review`.
- [ ] **Step 6: commit** (if the user asks), on `chore/viti-ui-v3`: `refactor: move to viti-ui 3.0.0 (vUse composables)`.

### Task 4: VitiDiagnostics on viti-ui 3.0.0

**Files:**
- Modify: `frontend/package.json` (`#v2.0.0` → `#v3.0.0`) and `package-lock.json`
- Modify (imports and calls): `frontend/src/main.ts`, `features/system/InfoTable.vue`, `NetworkTable.vue`, `SoftwareTable.vue`
- Modify, on `claude-config`: `CLAUDE.md`

**Interfaces:**
- Consumes: the modules from Task 1.

- [ ] **Step 1:** `npm install github:Byzthr/viti-ui#v3.0.0` from `frontend/`.
- [ ] **Step 2: verify that it breaks:** `npm run build`. Expected: FAIL from a missing `use…` module.
- [ ] **Step 3:** change imports and calls in the files listed.
- [ ] **Step 4: verify:** `npm run test && npm run lint && npm run build`. Expected: green, and the `grep` from Task 2 with no output.
- [ ] **Step 5:** `CLAUDE.md` on `claude-config`, with `doc-review`.
- [ ] **Step 6: commit** (if the user asks), on `chore/viti-ui-v3`: `refactor: move to viti-ui 3.0.0 (vUse composables)`.
