import { parseMessage } from "./message.parser.js";

console.log(
  JSON.stringify(
    parseMessage("beli makan ayam 40rb cash sama bensin 60rb gopay"),
    null,
    2
  )
);