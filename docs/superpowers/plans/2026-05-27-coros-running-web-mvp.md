# COROS Running Web MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local web MVP that demonstrates the COROS-only running coaching product: daily review, readiness judgment, next-three-day adjustments, subscription limits, and CSV / image / calendar export.

**Architecture:** Add a self-contained `web/` Vite TypeScript app inside the existing skill repository. Keep coaching logic in pure domain modules with Vitest coverage, and keep the UI as a thin browser layer that renders mock COROS data and calls tested domain functions.

**Tech Stack:** Vite, TypeScript, Vitest, browser Canvas API, vanilla DOM rendering, CSS.

---

## File Structure

- Create `docs/prd/coros-running-web-prd.md` for the product requirements.
- Create `web/package.json` for scripts and dependencies.
- Create `web/index.html` as the app entry.
- Create `web/tsconfig.json` and `web/vite.config.ts` for TypeScript, Vite, and Vitest.
- Create `web/src/domain/types.ts` for shared data shapes.
- Create `web/src/domain/readiness.ts` for recovery and adjustment decisions.
- Create `web/src/domain/plan.ts` for sample plan data and next-three-day selection.
- Create `web/src/domain/exporters.ts` for CSV and ICS generation.
- Create `web/src/domain/*.test.ts` for TDD coverage.
- Create `web/src/main.ts` for UI rendering and export actions.
- Create `web/src/styles.css` for the web interface.

## Task 1: Project Scaffold

**Files:**
- Create: `web/package.json`
- Create: `web/index.html`
- Create: `web/tsconfig.json`
- Create: `web/vite.config.ts`

- [ ] **Step 1: Add Vite TypeScript project files**

Create a minimal Vite app using vanilla TypeScript and Vitest.

- [ ] **Step 2: Install dependencies**

Run: `npm install` from `web/`.

- [ ] **Step 3: Verify scaffold scripts**

Run: `npm test -- --run` from `web/`.

Expected: Vitest starts and reports no test files or passes once tests are added.

## Task 2: Readiness Decision Engine

**Files:**
- Create: `web/src/domain/types.ts`
- Create: `web/src/domain/readiness.test.ts`
- Create: `web/src/domain/readiness.ts`

- [ ] **Step 1: Write failing tests for readiness decisions**

Test that poor recovery indicators downgrade intensity, normal indicators keep the plan, and severe warning signs recommend rest.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/domain/readiness.test.ts` from `web/`.

Expected: FAIL because `evaluateReadiness` does not exist.

- [ ] **Step 3: Implement minimal readiness logic**

Implement deterministic rules using HRV, resting heart rate, sleep score, recovery score, and latest workout intensity.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/domain/readiness.test.ts` from `web/`.

Expected: PASS.

## Task 3: Plan and Export Logic

**Files:**
- Create: `web/src/domain/exporters.test.ts`
- Create: `web/src/domain/exporters.ts`
- Create: `web/src/domain/plan.ts`

- [ ] **Step 1: Write failing tests for CSV and ICS export**

Test that CSV contains Chinese headers and that ICS contains calendar events with stable dates.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run src/domain/exporters.test.ts` from `web/`.

Expected: FAIL because exporters do not exist.

- [ ] **Step 3: Implement plan helpers and exporters**

Implement `getNextThreeDays`, `createTrainingCsv`, and `createTrainingIcs`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- --run src/domain/exporters.test.ts` from `web/`.

Expected: PASS.

## Task 4: Web Interface

**Files:**
- Create: `web/src/main.ts`
- Create: `web/src/styles.css`

- [ ] **Step 1: Build the UI**

Render a polished single-page MVP with hero positioning, onboarding steps, COROS authorization status, daily review, readiness judgment, next-three-day table, subscription card, and export buttons.

- [ ] **Step 2: Wire export actions**

CSV and ICS buttons download generated files. PNG button renders a share card to Canvas and downloads it.

- [ ] **Step 3: Include disclaimers**

Display that the product only provides training suggestions and does not provide medical diagnosis or guarantee race results.

## Task 5: Verification

**Files:**
- Modify: any files needed to fix verification issues.

- [ ] **Step 1: Run tests**

Run: `npm test -- --run` from `web/`.

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run: `npm run build` from `web/`.

Expected: TypeScript and Vite build succeeds.

- [ ] **Step 3: Start local server**

Run: `npm run dev -- --host 127.0.0.1`.

Expected: local URL is available for manual review.

