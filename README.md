# What If Money

A visual financial scenario planner. Enter your income and expenses, add "what if" scenarios, and watch your financial future morph in real time through interactive D3 charts.

**Target user**: Anyone anxious about money who wants to answer "will I be okay?" without spreadsheets.

## How It Works

1. Enter monthly income and recurring expenses
2. See a 12-month timeline chart of your financial trajectory
3. Add what-if scenarios: holiday, job loss, pay rise, new subscription
4. Watch the chart animate as scenarios stack

## Tech Stack

- **Next.js** (App Router) with TypeScript
- **D3.js** for interactive charts with smooth morphing transitions
- **CSS Modules** for styling
- **Jest** for unit tests

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── app/              Next.js app router pages
├── components/
│   ├── FinanceTimeline   D3 chart with animated transitions
│   ├── IncomeForm        Monthly income/expense input
│   ├── ScenarioCard      Individual scenario display
│   └── ScenarioList      Scenario management + add form
├── hooks/
│   └── useFinanceState   Core state management
└── lib/
    ├── calculator.ts     Pure financial projection engine
    ├── calculator.test.ts
    └── types.ts          Shared TypeScript types
```

## Tests

```bash
npx jest
```

10 tests covering the calculator engine: basic projection, break-even, negative cash flow, one-off expenses, income changes, recurring expenses, stacked scenarios, job loss simulation.

## Roadmap

- [ ] Share as image export
- [ ] Firebase Auth + save/load scenarios
- [ ] Pro tier (unlimited scenarios, longer timeframes, advanced scenario types)
- [ ] Compare scenarios side by side
- [ ] 3D "landscape" view (Three.js stretch goal)
