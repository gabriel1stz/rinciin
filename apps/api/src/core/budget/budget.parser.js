import { parseAmount } from "../parser/amount.parser.js";

export function parseBudget(text) {
  const lower = String(text).toLowerCase();
  const amount = parseAmount(lower);

  let categoryName = "Lainnya";

  if (/makan|makanan|food|bakso|ayam|mie/.test(lower)) {
    categoryName = "Makan";
  } else if (/transport|bensin|grab|gojek|tol|parkir/.test(lower)) {
    categoryName = "Transportasi";
  } else if (/belanja|minimarket|supermarket/.test(lower)) {
    categoryName = "Belanja";
  } else if (/kopi/.test(lower)) {
    categoryName = "Kopi";
  } else if (/rokok|udud/.test(lower)) {
    categoryName = "Rokok";
  } else if (/pulsa|kuota|wifi/.test(lower)) {
    categoryName = "Internet & Pulsa";
  } else if (/listrik|air|pdam|token/.test(lower)) {
    categoryName = "Tagihan";
  }

  return {
    categoryName,
    amount,
    period: "month"
  };
}