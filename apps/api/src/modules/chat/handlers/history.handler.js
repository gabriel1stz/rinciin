import { searchTransactions } from "../../transaction/transaction.service.js";
import { parseHistoryMessage } from "../../../core/parser/history.parser.js";
import { formatHistoryText } from "../../formatter/history.formatter.js";

export async function historyHandler(body, user) {
  // 1. Serahkan tugas baca chat ke parser khusus
  const filter = parseHistoryMessage(body.message);

  // 2. Tembak ke database lewat service pakai filter hasil parsing
  const transactions = await searchTransactions(
    user.phone,
    filter,
    user.id
  );


  // 3. Return balikan ke WA
  return {
    success: true,
    intent: "GET_HISTORY",
    transactions,
    text: formatHistoryText(
      transactions
    )
  };
}