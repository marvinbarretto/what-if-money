export type ScenarioType = "one-off-expense" | "income-change" | "recurring-expense";

export interface Scenario {
  id: string;
  type: ScenarioType;
  name: string;
  amount: number; // positive = money in, negative = money out
  month: number; // 0-indexed month offset from start (0 = this month)
  // For recurring-expense: how many months it lasts (undefined = indefinite)
  duration?: number;
}

export interface FinancialInputs {
  monthlyIncome: number;
  monthlyExpenses: number; // total recurring expenses
}

export interface MonthlySnapshot {
  month: number;
  label: string; // e.g. "Mar 2026"
  balance: number;
  income: number;
  expenses: number;
  net: number; // income - expenses for that month
}

export interface Projection {
  months: MonthlySnapshot[];
  scenarios: Scenario[];
}
