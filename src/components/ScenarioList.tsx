"use client";

import { useState } from "react";
import { Scenario, ScenarioType } from "@/lib/types";
import { ScenarioCard } from "./ScenarioCard";
import styles from "./ScenarioCard.module.css";

interface Props {
  scenarios: Scenario[];
  onAdd: (scenario: Scenario) => void;
  onRemove: (id: string) => void;
}

const PRESETS: { label: string; type: ScenarioType; amount: number; name: string }[] = [
  { label: "Holiday", type: "one-off-expense", amount: -2000, name: "Holiday" },
  { label: "Pay rise", type: "income-change", amount: 500, name: "Pay rise" },
  { label: "Job loss", type: "income-change", amount: -3000, name: "Job loss" },
  { label: "New subscription", type: "recurring-expense", amount: -50, name: "New subscription" },
];

export default function ScenarioList({ scenarios, onAdd, onRemove }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<ScenarioType>("one-off-expense");
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMonth, setFormMonth] = useState("0");
  const [formDuration, setFormDuration] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormAmount("");
    setFormMonth("0");
    setFormDuration("");
    setFormType("one-off-expense");
    setShowForm(false);
  };

  const handleSubmit = () => {
    const amount = parseFloat(formAmount);
    if (!formName.trim() || isNaN(amount) || amount === 0) return;

    const scenario: Scenario = {
      id: crypto.randomUUID(),
      type: formType,
      name: formName.trim(),
      amount: formType === "recurring-expense" ? -Math.abs(amount) : amount,
      month: parseInt(formMonth) || 0,
    };

    if (formType !== "one-off-expense" && formDuration) {
      scenario.duration = parseInt(formDuration);
    }

    onAdd(scenario);
    resetForm();
  };

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    onAdd({
      id: crypto.randomUUID(),
      type: preset.type,
      name: preset.name,
      amount: preset.amount,
      month: preset.type === "one-off-expense" ? 3 : 0,
      ...(preset.name === "Job loss" ? { duration: 3 } : {}),
    });
  };

  const canSubmit = formName.trim() && formAmount && parseFloat(formAmount) !== 0;

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <div className={styles.listTitle}>What-If Scenarios</div>
        {!showForm && (
          <button className={styles.addButton} onClick={() => setShowForm(true)}>
            + Add scenario
          </button>
        )}
      </div>

      {scenarios.length === 0 && !showForm && (
        <div className={styles.empty}>
          <p>No scenarios yet. Add one or try a preset:</p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.75rem", flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={styles.addButton}
                onClick={() => handlePreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {scenarios.map((s) => (
        <ScenarioCard key={s.id} scenario={s} onRemove={onRemove} />
      ))}

      {showForm && (
        <div className={styles.addForm}>
          <div className={styles.addFormRow}>
            <div className={styles.addFormFieldFull}>
              <label className={styles.addFormLabel}>Scenario name</label>
              <input
                className={styles.addFormInput}
                type="text"
                placeholder="e.g. Summer holiday"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className={styles.addFormRow}>
            <div className={styles.addFormField}>
              <label className={styles.addFormLabel}>Type</label>
              <select
                className={styles.addFormSelect}
                value={formType}
                onChange={(e) => setFormType(e.target.value as ScenarioType)}
              >
                <option value="one-off-expense">One-off expense</option>
                <option value="income-change">Income change</option>
                <option value="recurring-expense">Recurring expense</option>
              </select>
            </div>
            <div className={styles.addFormField}>
              <label className={styles.addFormLabel}>
                Amount (&pound;){formType === "income-change" ? " — use negative for loss" : ""}
              </label>
              <input
                className={styles.addFormInput}
                type="number"
                placeholder="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.addFormRow}>
            <div className={styles.addFormField}>
              <label className={styles.addFormLabel}>Starting month (1-12)</label>
              <input
                className={styles.addFormInput}
                type="number"
                min="0"
                max="11"
                value={formMonth}
                onChange={(e) => setFormMonth(e.target.value)}
              />
            </div>
            {formType !== "one-off-expense" && (
              <div className={styles.addFormField}>
                <label className={styles.addFormLabel}>Duration (months, blank = forever)</label>
                <input
                  className={styles.addFormInput}
                  type="number"
                  min="1"
                  placeholder="Indefinite"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className={styles.addFormActions}>
            <button className={styles.addFormCancel} onClick={resetForm}>
              Cancel
            </button>
            <button
              className={styles.addFormSubmit}
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Add scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
