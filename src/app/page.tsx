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
        <h1 className={styles.title}>What If Money</h1>
        <p className={styles.subtitle}>
          See how your financial future changes with every decision
        </p>
      </header>
      <main className={styles.main}>
        <IncomeForm inputs={inputs} onChange={setInputs} />
        <FinanceTimeline data={hasInputs ? projection.months : []} />
        <ScenarioList
          scenarios={scenarios}
          onAdd={addScenario}
          onRemove={removeScenario}
        />
      </main>
    </div>
  );
}
