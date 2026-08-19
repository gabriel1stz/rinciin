import { findLastTransaction, deleteTransaction } from "./undo.repository.js";
import { addWalletBalance } from "../wallet/wallet.service.js";
import { formatUndoText } from "../formatter/undo.formatter.js";

export async function undoTransaction(userId) {
  const trx = await findLastTransaction(userId);

  if (!trx) {
    return {
      success: false,
      text: "❌ Belum ada transaksi yang bisa dibatalkan (undo)."
    };
  }

  let wallet;
  if (trx.type === "EXPENSE") {
    wallet = await addWalletBalance(
      userId,
      trx.wallet.name,
      trx.amount
    );
  } else {
    wallet = await addWalletBalance(
      userId,
      trx.wallet.name,
      -trx.amount
    );
  }

  await deleteTransaction(trx.id);

  trx.wallet.balance = wallet?.balance ?? trx.wallet.balance;

  return {
    success: true,
    type: "UNDO_TRANSACTION",
    transaction: trx,
    text: formatUndoText(trx)
  };
}