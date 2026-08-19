export function categoryIcon(category = "") {
  const name = category.toLowerCase();

  if (name.includes("makan")) return "🍜";
  if (name.includes("transport")) return "⛽";
  if (name.includes("belanja")) return "🛒";
  if (name.includes("kopi")) return "☕";
  if (name.includes("internet")) return "📶";
  if (name.includes("tagihan")) return "🧾";
  if (name.includes("gaji")) return "💰";
  if (name.includes("bonus")) return "🎁";

  return "📂";
}