import {
  findTransactionByCode,
  findLatestTransaction,
  deleteTransaction
} from "./delete.repository.js";
import { addWalletBalance } from "../wallet/wallet.service.js";
import { formatDeleteText } from "../formatter/delete.formatter.js";

export async function deleteTransactionService(userId, code = null, isLatest = false) {
  let trx = null;

  if (code) {
    trx = await findTransactionByCode(userId, code);
  } else if (isLatest) {
    trx = await findLatestTransaction(userId);
  }

  if (!trx) {
    return {
      success: false,
      text: code
        ? `❌ Transaksi dengan kode "${code}" tidak ditemukan.`
        : "❌ Belum ada transaksi yang bisa dihapus."
    };
  }

  let updatedWallet;
  if (trx.type === "EXPENSE") {
    updatedWallet = await addWalletBalance(
      userId,
      trx.wallet.name,
      trx.amount
    );
  } else {
    updatedWallet = await addWalletBalance(
      userId,
      trx.wallet.name,
      -trx.amount
    );
  }

  await deleteTransaction(trx.id);

  trx.wallet.balance = updatedWallet?.balance ?? trx.wallet.balance;

  return {
    success: true,
    type: "DELETE_TRANSACTION",
    transaction: trx,
    text: formatDeleteText(trx)
  };
}