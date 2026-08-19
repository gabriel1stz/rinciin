import { parseAmount } from "./amount.parser.js";
import { normalizeWalletName } from "../wallet/wallet.engine.js";

export function parseWalletTransfer(text = "") {
  const lower = text.toLowerCase();

  const amount = parseAmount(lower);

  const match =
    lower.match(
      /(transfer|pindah)\s+(.+?)\s+(ke|->)\s+(.+)/
    );

  if (!match) {
    return null;
  }

  return {
    fromWallet: normalizeWalletName(match[2]),
    toWallet: normalizeWalletName(match[4]),
    amount
  };
}