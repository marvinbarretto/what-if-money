import { FinancialInputs, MonthlySnapshot, Projection, Scenario } from "./types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getMonthLabel(monthOffset: number, startDate: Date = new Date()): string {
  const d = new Date(startDate.getFullYear(), startDate.getMonth() + monthOffset, 1);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function projectFinances(
  inputs: FinancialInputs,
  scenarios: Scenario[],
  numMonths: number = 12,
  startDate: Date = new Date()
): Projection {
  const months: MonthlySnapshot[] = [];
  let runningBalance = 0;

  for (let i = 0; i < numMonths; i++) {
    let income = inputs.monthlyIncome;
    let expenses = inputs.monthlyExpenses;
    let oneOffTotal = 0;

    for (const scenario of scenarios) {
      switch (scenario.type) {
        case "income-change": {
          const active = i >= scenario.month &&
            (scenario.duration === undefined || i < scenario.month + scenario.duration);
          if (active) {
            income += scenario.amount;
          }
          break;
        }
        case "recurring-expense": {
          const active = i >= scenario.month &&
            (scenario.duration === undefined || i < scenario.month + scenario.duration);
          if (active) {
            // amount is negative, so subtracting a negative adds to expenses
            expenses -= scenario.amount;
          }
          break;
        }
        case "one-off-expense": {
          if (i === scenario.month) {
            oneOffTotal += scenario.amount;
          }
          break;
        }
      }
    }

    const net = income - expenses + oneOffTotal;
    runningBalance += net;

    months.push({
      month: i,
      label: getMonthLabel(i, startDate),
      balance: runningBalance,
      income,
      expenses,
      net,
    });
  }

  return { months, scenarios };
}
