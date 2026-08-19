import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatReport(report) {
  const periodTitle =
    report.period === "today"
      ? "Hari Ini"
      : report.period === "week"
      ? "Minggu Ini"
      : "Bulan Ini";

  const income = Number(report.totalIncome ?? report.income ?? 0);
  const expense = Number(report.totalExpense ?? report.expense ?? 0);
  const balance = Number(report.netBalance ?? report.balance ?? 0);

  const lines = [];
  lines.push(`📊 *Laporan Keuangan (${periodTitle})*`);
  lines.push("━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`💰 *Total Pemasukan:* ${formatRupiah(income)}`);
  lines.push(`💸 *Total Pengeluaran:* ${formatRupiah(expense)}`);
  lines.push(`💵 *Arus Kas Bersih:* ${formatRupiah(balance)}`);
  lines.push(`📝 *Jumlah Transaksi:* ${report.transactionCount ?? 0} kali`);

  if (report.breakdown && Object.keys(report.breakdown).length > 0) {
    lines.push("");
    lines.push("🏷️ *Rincian Pengeluaran:*");
    const sortedCategories = Object.entries(report.breakdown).sort((a, b) => b[1] - a[1]);
    for (const [cat, amt] of sortedCategories) {
      const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0;
      lines.push(`• ${cat}: ${formatRupiah(amt)} (${pct}%)`);
    }
  }

  if (report.insight && typeof report.insight === "string" && report.insight.trim()) {
    lines.push("");
    lines.push(`💡 *Insight:* ${report.insight}`);
  }

  lines.push("");
  lines.push("Ada hal lain yang bisa dibantu? 🧑‍💻");

  return lines.join("\n");
}