/**
 * Indonesian Words to Number Parser
 * Converts spoken number phrases like:
 * "dua juta" -> 2000000
 * "satu juta" / "sejuta" -> 1000000
 * "dua koma lima juta" -> 2500000
 * "dua setengah juta" -> 2500000
 * "lima puluh ribu" -> 50000
 * "seratus lima puluh ribu" -> 150000
 * "dua ratus lima puluh ribu" -> 250000
 * "tiga puluh lima ribu" -> 35000
 * "seratus ribu" -> 100000
 * "dua puluh ribu" -> 20000
 * "sepuluh ribu" -> 10000
 * "seribu" -> 1000
 * "dua ribu" -> 2000
 */

const DIGITS = {
  kosong: 0,
  nol: 0,
  satu: 1,
  se: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9
};

export function parseIndonesianWordsAmount(text = "") {
  if (!text) return null;
  const lower = String(text).toLowerCase();

  // 1. Handle "X koma Y juta / ribu" e.g. "satu koma lima juta", "dua koma lima jt", "1 koma 5 juta"
  const komaMatch = lower.match(/(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|\d+)\s+koma\s+(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|\d+)\s*(juta|jt|ribu|rb|k)?/i);
  if (komaMatch) {
    const whole = DIGITS[komaMatch[1]] !== undefined ? DIGITS[komaMatch[1]] : Number(komaMatch[1]);
    const frac = DIGITS[komaMatch[2]] !== undefined ? DIGITS[komaMatch[2]] : Number(komaMatch[2]);
    const unit = komaMatch[3] || "";
    const val = Number(`${whole}.${frac}`);
    if (!isNaN(val)) {
      if (/juta|jt/i.test(unit)) return Math.round(val * 1000000);
      if (/ribu|rb|k/i.test(unit)) return Math.round(val * 1000);
      return Math.round(val * 1000000); // default koma in rupiah usually denotes millions
    }
  }

  // 2. Handle "setengah juta" -> 500.000 / "X setengah juta" -> X.5 juta
  const setengahMatch = lower.match(/(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|\d+)?\s*setengah\s+(juta|jt|ribu|rb)/i);
  if (setengahMatch) {
    const base = setengahMatch[1] ? (DIGITS[setengahMatch[1]] !== undefined ? DIGITS[setengahMatch[1]] : Number(setengahMatch[1])) : 0;
    const unit = setengahMatch[2];
    const val = base + 0.5;
    if (/juta|jt/i.test(unit)) return Math.round(val * 1000000);
    if (/ribu|rb/i.test(unit)) return Math.round(val * 1000);
  }

  // 3. Extract spoken number tokens (e.g. "dua ratus lima puluh ribu", "dua juta", "tiga puluh lima ribu")
  const numberWordRegex = /\b(sejuta|seratus|seribu|sepuluh|sebelas|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|belas|puluh|ratus|ribu|juta|\d+)\b/gi;
  const matches = lower.match(numberWordRegex);

  if (!matches || matches.length === 0) {
    return null;
  }

  // Check if at least one major multiplier or quantity is present
  const hasMultiplier = matches.some((w) => ["juta", "sejuta", "ribu", "seribu", "ratus", "seratus", "puluh", "sepuluh"].includes(w.toLowerCase()));
  if (!hasMultiplier && matches.length === 1 && !/^\d+$/.test(matches[0])) {
    return null;
  }

  let total = 0;
  let currentGroup = 0; // accumulated number before million / thousand
  let currentNum = 0;

  for (let i = 0; i < matches.length; i++) {
    const word = matches[i].toLowerCase();

    if (word === "sejuta") {
      total += 1000000;
      currentGroup = 0;
      currentNum = 0;
    } else if (word === "juta") {
      const multiplierGroup = currentGroup + currentNum || 1;
      total += multiplierGroup * 1000000;
      currentGroup = 0;
      currentNum = 0;
    } else if (word === "seribu") {
      currentGroup += 1000;
      currentNum = 0;
    } else if (word === "ribu") {
      const multiplierGroup = currentGroup + currentNum || 1;
      currentGroup = multiplierGroup * 1000;
      currentNum = 0;
    } else if (word === "seratus") {
      currentGroup += 100;
      currentNum = 0;
    } else if (word === "ratus") {
      currentGroup += (currentNum || 1) * 100;
      currentNum = 0;
    } else if (word === "sepuluh") {
      currentGroup += 10;
      currentNum = 0;
    } else if (word === "sebelas") {
      currentGroup += 11;
      currentNum = 0;
    } else if (word === "belas") {
      currentGroup += 10 + (currentNum || 0);
      currentNum = 0;
    } else if (word === "puluh") {
      currentGroup += (currentNum || 1) * 10;
      currentNum = 0;
    } else if (DIGITS[word] !== undefined) {
      currentNum = DIGITS[word];
    } else if (/^\d+$/.test(word)) {
      currentNum = Number(word);
    }
  }

  const result = total + currentGroup + currentNum;

  if (result > 0) {
    return result;
  }

  return null;
}
