const STOP_WORDS = [
  "yaudah",
  "ya udah",
  "udah",
  "udah deh",
  "atuh",
  "dong",
  "nih",
  "bro",
  "bang",
  "cuy",
  "weh",
  "eh",
  "tadi",
  "barusan",
  "gw",
  "gua",
  "gue",
  "aku",
  "saya",
  "deh",
  "lah",
  "please",
  "tolong"
];

export function removeStopWords(text = "") {

  let result = text.toLowerCase();

  for (const word of STOP_WORDS) {

    const regex = new RegExp(`\\b${word}\\b`, "gi");

    result = result.replace(regex, " ");

  }

  return result
    .replace(/\s+/g, " ")
    .trim();

}