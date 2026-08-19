export function parseDelete(text = "") {

  const match = text.match(/rin-[a-z0-9]+/i);

  return {
    code: match ? match[0].toUpperCase() : null
  };
}