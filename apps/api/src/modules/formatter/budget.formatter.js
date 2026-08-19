import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatBudgetText(budget) {
  const target = budget.effectiveBudget ?? budget.limit ?? budget.budget ?? 0;
  const used = budget.spent ?? budget.used ?? 0;

  return [
    "📊 Budget",
    "",
    "━━━━━━━━━━━━━━",
    "",
    `🎯 Target : ${formatRupiah(target)}`,
    `💸 Terpakai : ${formatRupiah(used)}`,
    `💰 Sisa : ${formatRupiah(budget.remaining)}`,
    `📈 Progress : ${budget.percentage}%`,
    "",
    "Ada hal lain yang bisa dibantu? 🧑‍💻",
  ].join("\n");
}

export const formatBudget = formatBudgetText;
export const formatBudgetCreatedText = formatBudgetText;
