import { findTransactionsByUserId } from "./repositories/report.repository.js";
import { buildInsight } from "../../core/insight/insight.engine.js";

export async function getReport(userId, period = "month") {
  let startDate = new Date();

  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  const transactions = await findTransactionsByUserId(userId, startDate);

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((a, b) => a + Number(b.amount || 0), 0);

  const breakdown = {};

  for (const tx of transactions) {
    if (tx.type !== "EXPENSE") continue;

    const name = tx.category?.name ?? "Lainnya";
    breakdown[name] = (breakdown[name] || 0) + Number(tx.amount || 0);
  }

  const insight = buildInsight(transactions);

  return {
    period,
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    breakdown,
    insight,
    transactions
  };
}

