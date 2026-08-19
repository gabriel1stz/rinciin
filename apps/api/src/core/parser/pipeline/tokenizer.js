export function tokenize(text) {
  return text.split(/\s+/).filter(Boolean);
}