import { parseAmount } from "./amount.parser.js";
import { normalizeWalletName } from "../wallet/wallet.engine.js";

export function parseWalletUpdate(text = "") {
  const lower = text.toLowerCase();

  let operation = "ADD";

  if (
    lower.startsWith("kurangi") ||
    lower.startsWith("ambil") ||
    lower.startsWith("tarik")
  ) {
    operation = "SUBTRACT";
  }

  const amount = parseAmount(lower);

  const walletName = normalizeWalletName(lower);

  return {
    operation,
    walletName,
    amount
  };
}