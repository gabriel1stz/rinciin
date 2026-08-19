export function parseMoney(text) {

  let t = text.toLowerCase();

  t = t.replace(/\./g, "");

  const jt = t.match(/(\d+(?:,\d+)?)\s*jt/);

  if (jt) {
    return Math.round(parseFloat(jt[1].replace(",", ".")) * 1000000);
  }

  const rb = t.match(/(\d+(?:,\d+)?)\s*rb/);

  if (rb) {
    return Math.round(parseFloat(rb[1].replace(",", ".")) * 1000);
  }

  const angka = t.match(/\d+/);

  if (angka) {
    return parseInt(angka[0]);
  }

  return null;
}