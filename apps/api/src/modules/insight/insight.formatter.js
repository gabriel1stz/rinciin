export function formatInsightText(insights) {
  if (!insights.length) return "";

  const lines = [];

  lines.push("Insight");
  lines.push("━━━━━━━━━━━━━━");

  insights.forEach((item) => {
    lines.push(`• ${item}`);
  });

  return lines.join("\n");
}