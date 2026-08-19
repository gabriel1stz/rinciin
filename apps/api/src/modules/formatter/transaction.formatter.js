import { formatRupiah } from "../../helpers/currency.helper.js";
import { walletIcon } from "../../helpers/wallet.helper.js";
import { categoryIcon } from "../../helpers/category.helper.js";

function formatDate(date) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function formatTransactionText(result) {
  const transactions = result.transactions || [];

  if (!transactions.length) {
    return "Tidak ada transaksi.";
  }

  const lines = [];

  const total = transactions.length;

  const type =
    transactions[0].type === "INCOME"
      ? "pemasukan"
      : "pengeluaran";

  lines.push(
    `✅ Berhasil mencatat ${total} ${total > 1 ? "transaksi" : type}`
  );

  transactions.forEach((trx, index) => {

    lines.push("");
    lines.push("━━━━━━━━━━━━━━");
    lines.push("");

    lines.push(`🆔 ID Transaksi : ${trx.transactionCode}`);
    lines.push(`📆 Tanggal : ${formatDate(trx.createdAt)}`);
    lines.push(`${index + 1}️⃣ Deskripsi : ${trx.note}`);
    lines.push(
      `${categoryIcon(trx.categoryName)} Sub Kategori : ${trx.subCategory || trx.categoryName}`
    );
    lines.push(`🤑 Harga : ${formatRupiah(trx.amount)}`);
    lines.push(
      `${walletIcon(trx.wallet.name)} Dompet : ${trx.wallet.name}`
    );
    lines.push(
      `💰 Saldo : ${formatRupiah(trx.wallet.balance)}`
    );

  });

  if (result.wallets?.length) {

    lines.push("");
    lines.push("━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("💳 Saldo Dompet");
    lines.push("");

    result.wallets.forEach(wallet => {
      lines.push(
        `${walletIcon(wallet.name)} ${wallet.name} • ${formatRupiah(wallet.balance)}`
      );
    });

  }

  if (result.budget) {
    lines.push("");
    lines.push("━━━━━━━━━━━━━━");
    lines.push("");

    const pct = result.budget.percentage || 0;
    const catName = result.budget.categoryName || "Kategori";

    if (pct >= 100) {
      lines.push(`🚨 *PERINGATAN OVERBUDGET!*`);
      lines.push(`Budget *${catName}* sudah melebihi batas: *${pct}%*`);
      lines.push(`Terpakai ${formatRupiah(result.budget.spent)} dari target ${formatRupiah(result.budget.budget)}`);
    } else if (pct >= 80) {
      lines.push(`⚠️ *PERINGATAN BUDGET (Mendekati Limit)*`);
      lines.push(`Budget *${catName}* sudah terpakai *${pct}%*`);
      lines.push(`Sisa budget: *${formatRupiah(result.budget.remaining)}* (${formatRupiah(result.budget.spent)} / ${formatRupiah(result.budget.budget)})`);
    } else {
      lines.push(`📊 *Budget ${catName}:* ${pct}%`);
      lines.push(`Sisa budget: ${formatRupiah(result.budget.remaining)}`);
    }
  }


  lines.push("");
  lines.push("Ada hal lain yang bisa dibantu? 🧑‍💻");

  return lines.join("\n");
}