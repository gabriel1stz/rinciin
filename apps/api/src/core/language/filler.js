const fillers=[

"dong",

"deh",

"yaudah",

"ya udah",

"tolong",

"please",

"coba",

"nih",

"bro",

"bang",

"kak",

"gan",

"woy",

"eh",

"bentar",

"sih",

"aja",

"lah"

];

export function removeFillers(text){

let t=text;

fillers.forEach(x=>{

t=t.replace(

new RegExp(`\\b${x}\\b`,"gi"),

""

);

});

return t

.replace(/\s+/g," ")

.trim();

}