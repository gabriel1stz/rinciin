import { parseAmount, removeAmount } from "./amount.parser.js";
import { parseWallet, removeWallet } from "./wallet.parser.js";
import { parseCategory } from "./category.parser.js";
import { removeStopWords } from "./stopword.parser.js";

function splitMessage(message) {
  return String(message)
    .split(/\n|,|\s+sama\s+|\s+dan\s+|\s+\+\s+/gi)
    .map((x) => x.trim())
    .filter(Boolean);
}

function cleanNote(text) {
  const VERBS = [
    "beli",
    "bayar",
    "buat",
    "untuk",
    "pakai",
    "pake",
    "isi",
    "topup",
    "top up",
    "transfer",
    "ambil",
    "kirim",
    "kasih"
  ];

  const regex = new RegExp(`\\b(${VERBS.join("|")})\\b`, "gi");

  return String(text)
    .replace(regex, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSingleTransaction(rawText) {

  const text = removeStopWords(rawText);

  const amount = parseAmount(text);

  if (!amount) return null;

  const wallet = parseWallet(text);

  const category = parseCategory(text);

  let note = removeAmount(text);

  note = removeWallet(note);

  note = cleanNote(note);

  return {
    type: category.type,
    amount,
    wallet,
    categoryName: category.categoryName,
    subCategory: category.subCategory,
    note: note || category.subCategory,
    rawText
  };

}

export function parseMessage(message) {

  const parts = splitMessage(message);

  console.log("========== SPLIT ==========");
  console.log(parts);
  console.log("===========================");

  const transactions =
    parts
      .map((part) => {

        const result = parseSingleTransaction(part);

        console.log("TRANSACTION");
        console.log(result);

        return result;

      })
      .filter(Boolean);

  return {

    success: transactions.length > 0,

    count: transactions.length,

    transactions

  };

}