import { processTransactionMessage } from "../../transaction/transaction.service.js";
import { formatTransactionText } from "../../formatter/transaction.formatter.js";
import { checkBudget } from "../../budget/budget.service.js";

export async function transactionHandler(body, user) {
  const result = await processTransactionMessage(
    user.phone,
    body.message,
    user.name
  );

  if (result.type === "TRANSACTION_SAVED") {
    const firstExpense = result.transactions?.find((t) => t.type === "EXPENSE");
    if (firstExpense?.categoryName) {
      try {
        const budgetInfo = await checkBudget(user.id, firstExpense.categoryName);
        if (budgetInfo) {
          result.budget = {
            ...budgetInfo,
            categoryName: firstExpense.categoryName
          };
        }
      } catch (e) {
        console.error("Error checking budget:", e.message);
      }
    }

    result.text = formatTransactionText(result);
  }

  return result;
}