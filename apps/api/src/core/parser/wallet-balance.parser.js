import { parseAmount } from "./amount.parser.js";
import { normalizeWalletName } from "../wallet/wallet.engine.js";

export function parseWalletBalance(text) {
  return {
    walletName: normalizeWalletName(text),
    balance: parseAmount(text)
  };
}