import { normalizeWalletName } from "../wallet/wallet.engine.js";

export function buildTransaction(user, parsed) {
  return {
    userId: user.id,
    walletName: normalizeWalletName(parsed.wallet),
    // Ambil string nama dari parser (bukan ID)
    categoryName: parsed.categoryName || "Lainnya",
    type: parsed.type,
    amount: parsed.amount,
    note: parsed.note,
    rawText: parsed.rawText,
    subCategory: parsed.subCategory
  };
}

export function buildBatchTransactions(user, parsedTransactions) {
  return parsedTransactions.map((parsed) => buildTransaction(user, parsed));
}