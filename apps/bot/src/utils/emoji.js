const emoji = {
  Food: "🍔",
  Coffee: "☕",
  Drink: "🥤",
  Transport: "⛽",
  Shopping: "🛍️",
  Bills: "🧾",
  Salary: "💼",
  Bonus: "🎁",
  Health: "🏥",
  Entertainment: "🎮",
  Education: "📚",
  Investment: "📈",
  Travel: "✈️",
  Other: "📦"
};

export function getEmoji(category) {
  return emoji[category] || "📌";
}