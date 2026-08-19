import { parseMoney } from "./money.parser.js";
import { parseIntent } from "./intent.parser.js";
import { parseCategory } from "./category.parser.js";

export function parseTransaction(text){

const amount=parseMoney(text);

const type=parseIntent(text);

const category=parseCategory(text);

return{

amount,
type,
category,
note:text

};

}