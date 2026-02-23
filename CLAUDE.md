# CLAUDE.md — What If Money

## What This Is

Visual financial scenario planner. Users enter income/expenses, add "what if" scenarios, and see their financial future morph via animated D3 charts. MVP — no auth, no backend, everything runs client-side.

## Tech Stack

- **Next.js 16** (App Router), TypeScript, React 19
- **D3.js 7** for charts (raw D3, not an abstraction — we need full animation control)
- **CSS Modules** for styling (no Tailwind)
- **Jest + ts-jest** for unit tests

## Architecture

```
Inputs (IncomeForm) → useFinanceState hook → calculator.ts (pure functions) → FinanceTimeline (D3)
                      ↑
Scenarios (ScenarioList/ScenarioCard) ─┘
```

**Key principle:** Calculator is pure — all financial projection logic in `src/lib/calculator.ts`, no D3 in the logic. Easily testable.

The D3 chart uses an update pattern (not full redraw) so paths morph smoothly when data changes.

## Key Files

- `src/lib/calculator.ts` — Pure projection engine. `projectFinances()` takes inputs + scenarios, returns monthly snapshots.
- `src/lib/calculator.test.ts` — 10 unit tests covering all scenario combinations.
- `src/lib/types.ts` — Shared types: `Scenario`, `FinancialInputs`, `MonthlySnapshot`, `Projection`.
- `src/components/FinanceTimeline.tsx` — D3 area/line chart. Morphs on data change, draw-on animation on first render.
- `src/components/IncomeForm.tsx` — Monthly income/expense inputs with live net calculation.
- `src/components/ScenarioCard.tsx` — Displays a single scenario.
- `src/components/ScenarioList.tsx` — Manages scenarios: presets, custom add form, remove.
- `src/hooks/useFinanceState.ts` — Core state: inputs, scenarios, derived projection.

## Conventions

- **Pure logic:** Financial calculations go in `lib/calculator.ts`, never in components.
- **CSS Modules:** One `.module.css` per component. Use CSS custom properties from `globals.css`.
- **No Tailwind.** Intentional choice — CSS Modules give full control for a premium feel.
- **Scenario amounts:** Negative = money out, positive = money in. Recurring expenses store negative amounts.
- **Month indexing:** 0-indexed offset from current month (0 = this month, 11 = 11 months from now).

## Design Tokens (globals.css)

```
--color-bg, --color-surface, --color-text, --color-text-secondary
--color-border, --color-accent, --color-accent-hover
--color-positive (green), --color-negative (red), --color-warning
--font-sans, --font-mono
--radius (8px), --radius-lg (12px)
```

Dark mode supported via `prefers-color-scheme`.

## Running

```bash
npm run dev      # Dev server
npm run build    # Production build
npx jest         # Run tests
npx tsc --noEmit # Type check
```

## What NOT to Do

- Don't put D3 logic in the calculator — keep it pure
- Don't add auth yet (planned for v0.2)
- Don't use Tailwind — CSS Modules is the intentional choice

## Notes

- Currently using raw D3 for animation control. If the D3 code gets unwieldy, **visx** (Airbnb) is the natural migration path — D3 primitives as React components.
