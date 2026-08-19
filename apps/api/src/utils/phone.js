export function normalizePhone(phone) {
  if (!phone) return null;

  let value = String(phone).replace(/\D/g, "");

  if (value.startsWith("0")) {
    value = "62" + value.slice(1);
  }

  if (value.startsWith("8")) {
    value = "62" + value;
  }

  return value;
}

export function isValidIndonesianPhone(phone) {
  const value = normalizePhone(phone);
  return /^62[0-9]{9,13}$/.test(value);
}