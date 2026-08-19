import { parseAmount } from "./amount.parser.js";

export function parseBudgetMessage(message) {
  const amount = parseAmount(message);

  if (!amount) return null;

  const category = message
    .toLowerCase()
    .replace(/^budget/i, "")
    .replace(/[0-9.,]+(rb|ribu|jt|juta)?/gi, "")
    .trim();

  return {
    categoryName:
      category.charAt(0).toUpperCase() +
      category.slice(1),

    amount,

    period: "month"
  };
}