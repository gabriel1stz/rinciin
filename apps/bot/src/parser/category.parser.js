const categories = {

Food:[
"kopi",
"makan",
"ayam",
"bakso",
"mie",
"nasi",
"pizza",
"kfc",
"mcd",
"burger"
],

Transport:[
"bensin",
"grab",
"gocar",
"gojek",
"tol",
"parkir"
],

Bills:[
"listrik",
"air",
"internet",
"wifi",
"token",
"pln"
],

Shopping:[
"belanja",
"sepatu",
"baju",
"celana",
"hoodie",
"tas"
],

Salary:[
"gaji",
"bonus",
"komisi"
]

};

export function parseCategory(text){

const t=text.toLowerCase();

for(const key in categories){

if(categories[key].some(x=>t.includes(x)))
return key;

}

return "Other";

}