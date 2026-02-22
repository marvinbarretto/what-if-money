"use client";

import { FinancialInputs } from "@/lib/types";
import styles from "./IncomeForm.module.css";

interface Props {
  inputs: FinancialInputs;
  onChange: (inputs: FinancialInputs) => void;
}

export default function IncomeForm({ inputs, onChange }: Props) {
  const net = inputs.monthlyIncome - inputs.monthlyExpenses;

  const handleChange = (field: keyof FinancialInputs, raw: string) => {
    const value = raw === "" ? 0 : parseFloat(raw);
    if (isNaN(value) || value < 0) return;
    onChange({ ...inputs, [field]: value });
  };

  const netClass = net > 0 ? styles.positive : net < 0 ? styles.negative : styles.neutral;

  return (
    <div className={styles.form}>
      <div className={styles.title}>Monthly Finances</div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="income">
            Income (after tax)
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.currency}>&pound;</span>
            <input
              id="income"
              className={styles.input}
              type="number"
              min="0"
              step="50"
              placeholder="0"
              value={inputs.monthlyIncome || ""}
              onChange={(e) => handleChange("monthlyIncome", e.target.value)}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="expenses">
            Regular expenses
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.currency}>&pound;</span>
            <input
              id="expenses"
              className={styles.input}
              type="number"
              min="0"
              step="50"
              placeholder="0"
              value={inputs.monthlyExpenses || ""}
              onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Monthly net</span>
        <span className={`${styles.summaryValue} ${netClass}`}>
          {net >= 0 ? "+" : ""}&pound;{Math.abs(net).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
