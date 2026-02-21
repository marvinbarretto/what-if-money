import { projectFinances, getMonthLabel } from "./calculator";
import { FinancialInputs, Scenario } from "./types";

describe("getMonthLabel", () => {
  it("returns formatted month label from a start date", () => {
    const start = new Date(2026, 1, 1); // Feb 2026
    expect(getMonthLabel(0, start)).toBe("Feb 2026");
    expect(getMonthLabel(1, start)).toBe("Mar 2026");
    expect(getMonthLabel(11, start)).toBe("Jan 2027");
  });
});

describe("projectFinances", () => {
  const baseInputs: FinancialInputs = {
    monthlyIncome: 3000,
    monthlyExpenses: 2000,
  };

  it("projects 12 months with no scenarios", () => {
    const result = projectFinances(baseInputs, [], 12);
    expect(result.months).toHaveLength(12);
    // Net is +1000/month, balance accumulates
    expect(result.months[0].balance).toBe(1000);
    expect(result.months[0].net).toBe(1000);
    expect(result.months[11].balance).toBe(12000);
  });

  it("handles break-even (income equals expenses)", () => {
    const inputs: FinancialInputs = {
      monthlyIncome: 2000,
      monthlyExpenses: 2000,
    };
    const result = projectFinances(inputs, [], 12);
    expect(result.months[0].balance).toBe(0);
    expect(result.months[11].balance).toBe(0);
  });

  it("handles negative cash flow", () => {
    const inputs: FinancialInputs = {
      monthlyIncome: 1500,
      monthlyExpenses: 2000,
    };
    const result = projectFinances(inputs, [], 6);
    expect(result.months[0].balance).toBe(-500);
    expect(result.months[5].balance).toBe(-3000);
  });

  it("applies a one-off expense in the correct month", () => {
    const scenarios: Scenario[] = [
      {
        id: "1",
        type: "one-off-expense",
        name: "Holiday",
        amount: -2000,
        month: 3,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 12);
    // Months 0-2: +1000/month cumulative (1000, 2000, 3000)
    expect(result.months[2].balance).toBe(3000);
    // Month 3: +1000 net minus 2000 one-off = -1000 that month, balance = 2000
    expect(result.months[3].balance).toBe(2000);
    // Month 4 onwards: back to +1000/month
    expect(result.months[4].balance).toBe(3000);
  });

  it("applies an income change from a given month", () => {
    const scenarios: Scenario[] = [
      {
        id: "2",
        type: "income-change",
        name: "Pay rise",
        amount: 500,
        month: 2,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 6);
    // Months 0-1: net +1000
    expect(result.months[0].net).toBe(1000);
    expect(result.months[1].net).toBe(1000);
    // Month 2+: income becomes 3500, net +1500
    expect(result.months[2].net).toBe(1500);
    expect(result.months[2].income).toBe(3500);
    expect(result.months[5].net).toBe(1500);
  });

  it("applies a recurring expense with limited duration", () => {
    const scenarios: Scenario[] = [
      {
        id: "3",
        type: "recurring-expense",
        name: "Gym membership",
        amount: -50,
        month: 1,
        duration: 3,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 6);
    // Month 0: normal (+1000)
    expect(result.months[0].net).toBe(1000);
    // Months 1-3: -50 extra expense
    expect(result.months[1].net).toBe(950);
    expect(result.months[2].net).toBe(950);
    expect(result.months[3].net).toBe(950);
    // Month 4: back to normal
    expect(result.months[4].net).toBe(1000);
  });

  it("applies a recurring expense with no duration (indefinite)", () => {
    const scenarios: Scenario[] = [
      {
        id: "4",
        type: "recurring-expense",
        name: "Streaming service",
        amount: -15,
        month: 0,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 6);
    // Every month: net = 1000 - 15 = 985
    for (const m of result.months) {
      expect(m.net).toBe(985);
    }
  });

  it("stacks multiple scenarios correctly", () => {
    const scenarios: Scenario[] = [
      {
        id: "a",
        type: "income-change",
        name: "Pay rise",
        amount: 500,
        month: 0,
      },
      {
        id: "b",
        type: "recurring-expense",
        name: "New flat",
        amount: -300,
        month: 0,
      },
      {
        id: "c",
        type: "one-off-expense",
        name: "Moving costs",
        amount: -1500,
        month: 0,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 3);
    // Month 0: income 3500, expenses 2300, one-off -1500
    // net = 3500 - 2300 - 1500 = -300
    expect(result.months[0].net).toBe(-300);
    expect(result.months[0].balance).toBe(-300);
    // Month 1: income 3500, expenses 2300, no one-off
    // net = 1200
    expect(result.months[1].net).toBe(1200);
    expect(result.months[1].balance).toBe(900);
  });

  it("simulates job loss (income drops to zero for N months)", () => {
    // Model as income-change of -3000 for 3 months
    const scenarios: Scenario[] = [
      {
        id: "jobloss",
        type: "income-change",
        name: "Job loss",
        amount: -3000,
        month: 2,
        duration: 3,
      },
    ];
    const result = projectFinances(baseInputs, scenarios, 8);
    // Months 0-1: normal, +1000/month
    expect(result.months[1].balance).toBe(2000);
    // Months 2-4: income = 0, expenses = 2000, net = -2000
    expect(result.months[2].net).toBe(-2000);
    expect(result.months[3].net).toBe(-2000);
    expect(result.months[4].net).toBe(-2000);
    // Month 4 balance: 2000 + (-2000 * 3) = -4000
    expect(result.months[4].balance).toBe(-4000);
    // Month 5+: back to normal +1000
    expect(result.months[5].net).toBe(1000);
  });
});
