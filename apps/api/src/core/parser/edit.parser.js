import { parseAmount } from "./amount.parser.js";

export function parseEdit(text = "") {
  const transactionCode = text.match(/RIN-[A-Z0-9]+/i)?.[0] || null;
  const cleaned = transactionCode ? text.replace(new RegExp(transactionCode, "i"), "") : text;

  return {
    amount: parseAmount(cleaned),
    latest: /terakhir/i.test(text),
    transactionCode: transactionCode ? transactionCode.toUpperCase() : null
  };
}