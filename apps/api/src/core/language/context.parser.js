import {normalize} from "./normalize.js";

import {removeFillers} from "./filler.js";

import {parseTime} from "./time.parser.js";

import {parseAction} from "./action.parser.js";

export function preprocess(text){

let t=normalize(text);

t=removeFillers(t);

return{

text:t,

action:parseAction(t),

time:parseTime(t)

};

}