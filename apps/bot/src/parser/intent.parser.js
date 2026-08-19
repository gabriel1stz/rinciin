const expense = [
  "beli",
  "bayar",
  "makan",
  "jajan",
  "isi",
  "topup",
  "transfer",
  "langganan"
];

const income = [
  "gaji",
  "bonus",
  "jual",
  "komisi",
  "freelance",
  "income",
  "masuk"
];

export function parseIntent(text){

const t=text.toLowerCase();

if(expense.some(v=>t.includes(v)))
return "expense";

if(income.some(v=>t.includes(v)))
return "income";

return null;

}