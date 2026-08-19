import { normalizeWalletName } from "../wallet/wallet.engine.js";

const WALLET_REGEX =
  /\b(cash|tunai|dana|gopay|go pay|go-pay|ovo|shopeepay|shopee pay|shopee-pay|shopee|spay|spay later|shopeepay later|linkaja|link aja|bca|bni|bri|mandiri|seabank|sea bank|jago|bank jago|jenius|bsi|cimb|cimb niaga|permata|rekening|rek|tabungan)\b/gi;

export function parseWallet(text = "") {
  return normalizeWalletName(text);
}

export function removeWallet(text = "") {
  return String(text)
    .replace(WALLET_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}