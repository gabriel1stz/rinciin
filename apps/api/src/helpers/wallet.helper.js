const icons = {
  Cash: "💵",
  Dana: "🔵",
  Gopay: "🟢",
  Ovo: "🟣",
  BCA: "🏦",
  BNI: "🏦",
  BRI: "🏦",
  Mandiri: "🏦",
  Seabank: "🏦"
};

export function walletIcon(name = "") {
  return icons[name] || "👛";
}