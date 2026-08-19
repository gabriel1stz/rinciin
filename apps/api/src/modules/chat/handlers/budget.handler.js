import { saveBudget, getBudgets } from "../../budget/budget.service.js";
import { formatBudgetText, formatBudgetCreatedText } from "../../formatter/budget.formatter.js";
import { parseBudget } from "../../../core/budget/budget.parser.js";

export async function budgetHandler(body, user) {

  if (body.intent === "SET_BUDGET") {

  const parsed = parseBudget(body.message);

  if (!parsed) {
    return {
      text: "❌ Format budget salah.\n\nContoh:\nbudget makan 2jt"
    };
  }

  const budget = await saveBudget(
    user.id,
    parsed
  );

  return {
    intent: "SET_BUDGET",
    budget,
    text: formatBudgetCreatedText(budget)
  };

}

  const budgets = await getBudgets(user.id);

  return {
    intent: "GET_BUDGET",
    budgets,
    text: formatBudgetText(budgets)
  };

}