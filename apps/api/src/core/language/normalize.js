const MAP={

rekening:"bca",

rekenening:"bca",

rekesning:"bca",

rek:"bca",

gopayy:"gopay",

dn:"dana",

dnn:"dana",

ovvo:"ovo",

gojekpay:"gopay",

duitku:"cash"

}

export function normalize(text){

let t=text.toLowerCase();

Object.entries(MAP).forEach(([k,v])=>{

t=t.replaceAll(k,v);

});

return t;

}