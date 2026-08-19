const income=[

"gaji",

"bonus",

"komisi",

"jualan",

"masuk",

"ditransfer"

];

const expense=[

"beli",

"bayar",

"isi",

"topup",

"traktir",

"jajan",

"langganan"

];

export function parseAction(text){

const t=text.toLowerCase();

if(

income.some(x=>t.includes(x))

){

return"INCOME";

}

if(

expense.some(x=>t.includes(x))

){

return"EXPENSE";

}

return null;

}