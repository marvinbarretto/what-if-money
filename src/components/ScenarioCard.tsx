"use client";

import { Scenario, ScenarioType } from "@/lib/types";
import styles from "./ScenarioCard.module.css";

const TYPE_LABELS: Record<ScenarioType, string> = {
  "one-off-expense": "One-off expense",
  "income-change": "Income change",
  "recurring-expense": "Recurring expense",
};

interface CardProps {
  scenario: Scenario;
  onRemove: (id: string) => void;
}

export function ScenarioCard({ scenario, onRemove }: CardProps) {
  const isExpense = scenario.amount < 0;
  const amountStr = `${isExpense ? "-" : "+"}\u00a3${Math.abs(scenario.amount).toLocaleString()}`;
  const suffix = scenario.type === "one-off-expense" ? "" : "/mo";

  let timing = `Month ${scenario.month + 1}`;
  if (scenario.type !== "one-off-expense") {
    timing = scenario.duration
      ? `From month ${scenario.month + 1} for ${scenario.duration} months`
      : `From month ${scenario.month + 1} onwards`;
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>{scenario.name}</div>
          <div className={styles.cardType}>{TYPE_LABELS[scenario.type]}</div>
        </div>
        <span className={`${styles.cardAmount} ${isExpense ? styles.expense : styles.income}`}>
          {amountStr}{suffix}
        </span>
        <button
          className={styles.removeButton}
          onClick={() => onRemove(scenario.id)}
          aria-label={`Remove ${scenario.name}`}
        >
          &times;
        </button>
      </div>
      <div className={styles.cardDetails}>
        <span>{timing}</span>
      </div>
    </div>
  );
}
