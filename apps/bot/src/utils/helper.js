// Mapping Icon otomatis
export function getWalletIcon(walletName) {
  const lower = walletName.toLowerCase();
  if (lower.includes("bca") || lower.includes("mandiri") || lower.includes("bri")) return "🏦";
  if (lower.includes("dana") || lower.includes("ovo")) return "🟣";
  if (lower.includes("gopay") || lower.includes("spay")) return "🟢";
  return "💵"; // Default Cash
}

// Get nama bulan berjalan (Bulan Juli)
export function getCurrentMonthName() {
  return new Date().toLocaleDateString("id-ID", { month: "long" });
}