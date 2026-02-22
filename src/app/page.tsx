"use client";

import { useFinanceState } from "@/hooks/useFinanceState";
import IncomeForm from "@/components/IncomeForm";
import ScenarioList from "@/components/ScenarioList";
import FinanceTimeline from "@/components/FinanceTimeline";
import styles from "./page.module.css";

export default function Home() {
  const {
    inputs,
    setInputs,
    scenarios,
    addScenario,
    removeScenario,
    projection,
    hasInputs,
  } = useFinanceState();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.tagline}>No spreadsheets. No stress.</div>
        <h1 className={styles.title}>What If Money</h1>
        <p className={styles.subtitle}>
          Add what-if scenarios and watch your financial future morph in real
          time. Will you be okay? Now you can see.
        </p>
      </header>
      <main className={styles.main}>
        <div className={styles.sidebar}>
          <IncomeForm inputs={inputs} onChange={setInputs} />
          <ScenarioList
            scenarios={scenarios}
            onAdd={addScenario}
            onRemove={removeScenario}
          />
        </div>
        <div className={styles.chartArea}>
          <FinanceTimeline data={hasInputs ? projection.months : []} />
        </div>
      </main>
      <footer className={styles.footer}>
        Built by Marvin Barretto
      </footer>
    </div>
  );
}
