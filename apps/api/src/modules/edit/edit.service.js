import { parseEdit } from "../../core/parser/edit.parser.js";
import {
  findLatestTransaction,
  findTransactionByCode,
  updateTransactionAmount
} from "./edit.repository.js";
import {
  addWalletBalance,
  subtractWalletBalance
} from "../wallet/wallet.service.js";
import { formatEditText } from "../formatter/edit.formatter.js";

export async function editTransaction(userId, message) {
  const parsed = parseEdit(message);

  let trx = null;

  if (parsed.transactionCode) {
    trx = await findTransactionByCode(userId, parsed.transactionCode);
  } else {
    trx = await findLatestTransaction(userId);
  }

  if (!trx) {
    return {
      success: false,
      text: "❌ Transaksi tidak ditemukan."
    };
  }

  if (!parsed.amount) {
    return {
      success: false,
      text: "❌ Nominal baru tidak terdeteksi.\n\nContoh:\n👉 *ubah 50rb* (edit transaksi terakhir)\n👉 *ubah RIN-123ABC 50rb*"
    };
  }

  const oldAmount = Number(trx.amount);
  const newAmount = Number(parsed.amount);
  const diff = newAmount - oldAmount;

  let updatedWallet = trx.wallet;

  if (diff !== 0) {
    if (trx.type === "EXPENSE") {
      if (diff > 0) {
        updatedWallet = await subtractWalletBalance(userId, trx.wallet.name, diff);
      } else {
        updatedWallet = await addWalletBalance(userId, trx.wallet.name, Math.abs(diff));
      }
    } else {
      if (diff > 0) {
        updatedWallet = await addWalletBalance(userId, trx.wallet.name, diff);
      } else {
        updatedWallet = await subtractWalletBalance(userId, trx.wallet.name, Math.abs(diff));
      }
    }
  }

  await updateTransactionAmount(trx.id, newAmount);


  const before = {
    ...trx,
    amount: oldAmount
  };

  const after = {
    ...trx,
    amount: newAmount,
    wallet: {
      ...trx.wallet,
      balance: updatedWallet?.balance ?? (Number(trx.wallet.balance) + (trx.type === "EXPENSE" ? -diff : diff))
    }
  };

  return {
    success: true,
    type: "TRANSACTION_EDITED",
    transaction: after,
    text: formatEditText(before, after)
  };
}