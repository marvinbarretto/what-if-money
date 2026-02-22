"use client";

import { useState, useMemo, useCallback } from "react";
import { FinancialInputs, Scenario, Projection } from "@/lib/types";
import { projectFinances } from "@/lib/calculator";

const DEFAULT_INPUTS: FinancialInputs = {
  monthlyIncome: 0,
  monthlyExpenses: 0,
};

export function useFinanceState() {
  const [inputs, setInputs] = useState<FinancialInputs>(DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const projection: Projection = useMemo(
    () => projectFinances(inputs, scenarios, 12),
    [inputs, scenarios]
  );

  const addScenario = useCallback((scenario: Scenario) => {
    setScenarios((prev) => [...prev, scenario]);
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const hasInputs = inputs.monthlyIncome > 0 || inputs.monthlyExpenses > 0;

  return {
    inputs,
    setInputs,
    scenarios,
    addScenario,
    removeScenario,
    projection,
    hasInputs,
  };
}
