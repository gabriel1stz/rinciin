export function cleanMessage(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}