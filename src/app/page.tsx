"use client";

import { useMemo } from "react";
import { projectFinances } from "@/lib/calculator";
import FinanceTimeline from "@/components/FinanceTimeline";
import styles from "./page.module.css";

export default function Home() {
  const projection = useMemo(
    () =>
      projectFinances(
        { monthlyIncome: 3000, monthlyExpenses: 2000 },
        [
          { id: "1", type: "one-off-expense", name: "Holiday", amount: -2000, month: 3 },
          { id: "2", type: "income-change", name: "Pay rise", amount: 500, month: 6 },
        ],
        12
      ),
    []
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>What If Money</h1>
        <p className={styles.subtitle}>
          See how your financial future changes with every decision
        </p>
      </header>
      <main className={styles.main}>
        <FinanceTimeline data={projection.months} />
      </main>
    </div>
  );
}
