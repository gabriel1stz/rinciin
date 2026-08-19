import { parseIndonesianWordsAmount } from "./words-to-number.js";

const WORDS_NUMBER_REGEX =
  /\b(sejuta|seratus|seribu|sepuluh|sebelas|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|belas|puluh|ratus|ribu|juta|setengah|koma)\b/gi;

export function parseAmount(text) {
  if (!text) return null;

  let normalized = String(text).toLowerCase().trim();

  // 1. Try standard numeric format with optional unit (e.g. 50rb, 2jt, 50.000, 2,5 jt)
  const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m)?/i);

  if (match) {
    let rawNumber = match[1];
    const unit = match[2];

    if (unit && rawNumber.includes(",")) {
      rawNumber = rawNumber.replace(",", ".");
    }

    if (!unit) {
      rawNumber = rawNumber.replace(/[.,]/g, "");
    }

    const number = Number(rawNumber);

    if (!Number.isNaN(number)) {
      if (["rb", "ribu", "k"].includes(unit?.toLowerCase())) return Math.round(number * 1000);
      if (["jt", "juta", "m"].includes(unit?.toLowerCase())) return Math.round(number * 1000000);

      if (number < 1000 && !unit) return number * 1000;

      return Math.round(number);
    }
  }

  // 2. Try Indonesian spoken words format (e.g. "dua juta", "lima puluh ribu", "seratus ribu")
  const wordAmount = parseIndonesianWordsAmount(normalized);
  if (wordAmount && wordAmount > 0) {
    return wordAmount;
  }

  return null;
}

export function removeAmount(text) {
  return String(text)
    .replace(/\d+(?:[.,]\d+)?\s*(rb|ribu|k|jt|juta|m)?/gi, "")
    .replace(WORDS_NUMBER_REGEX, "")
    .replace(/\s+/g, " ")
    .trim();
}