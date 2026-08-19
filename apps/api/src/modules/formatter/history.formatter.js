import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatHistoryText(transactions = []) {
  if (!transactions || !transactions.length) {
    return [
      "📜 *Riwayat Transaksi*",
      "━━━━━━━━━━━━━━",
      "Belum ada transaksi yang ditemukan.",
      "",
      "💡 *Tips:* Coba ketik:",
      "👉 *makan siang 35rb gopay*",
      "👉 *gaji 5jt bca*"
    ].join("\n");
  }

  const lines = [];
  lines.push("📜 *Riwayat Transaksi Terakhir*");
  lines.push("━━━━━━━━━━━━━━");
  lines.push("");

  let income = 0;
  let expense = 0;

  transactions.forEach((trx) => {
    const amt = Number(trx.amount || 0);
    const isIncome = trx.type === "INCOME";

    if (isIncome) {
      income += amt;
    } else {
      expense += amt;
    }

    const icon = isIncome ? "🟢" : "🔴";
    const walletName = trx.wallet?.name || "Cash";
    const categoryName = trx.category?.name || "Umum";
    const subCat = trx.subCategory ? ` (${trx.subCategory})` : "";

    lines.push(`${icon} *${trx.note || categoryName}*${subCat}`);
    lines.push(`   🆔 \`${trx.transactionCode}\``);
    lines.push(`   💸 ${isIncome ? "+" : "-"}${formatRupiah(amt)} • 👛 ${walletName}`);
    lines.push("");
  });

  lines.push("━━━━━━━━━━━━━━");
  lines.push(`💰 *Total Masuk:* ${formatRupiah(income)}`);
  lines.push(`💸 *Total Keluar:* ${formatRupiah(expense)}`);
  lines.push(`💵 *Arus Kas Bersih:* ${formatRupiah(income - expense)}`);
  lines.push("");
  lines.push("💡 *Tips:* Ketik *ubah [ID] [nominal]* untuk edit, atau *hapus [ID]* untuk hapus.");

  return lines.join("\n");
}