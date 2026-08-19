export function transactionEmoji(type) {
  return type === "INCOME"
    ? "🟢"
    : "🔴";
}

export function budgetEmoji(status) {
  switch (status) {
    case "SAFE":
      return "🟢";

    case "WARNING":
      return "🟡";

    case "OVER":
      return "🔴";

    default:
      return "⚪";
  }
}