import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatReceiptText({
  transaction,
  receiptData,
  walletBalance,
  allWallets = []
}) {
  const lines = [];

  lines.push("🧾 *Struk Berhasil Dipindai & Dicatat!*");
  lines.push("━━━━━━━━━━━━━━");
  lines.push("");

  lines.push(`🏪 *Merchant / Toko:* ${receiptData.merchant || "Nota Belanja"}`);
  lines.push(`🆔 *ID Transaksi:* \`${transaction.transactionCode}\``);
  lines.push(`🏷️ *Kategori:* ${transaction.category?.name || receiptData.categoryName}${receiptData.subCategory ? ` (${receiptData.subCategory})` : ""}`);
  lines.push(`💸 *Total Belanja:* ${formatRupiah(transaction.amount)}`);
  lines.push(`👛 *Dompet:* ${transaction.wallet?.name || receiptData.paymentMethod}`);
  lines.push(`💰 *Sisa Saldo:* ${formatRupiah(walletBalance)}`);

  if (receiptData.items && receiptData.items.length > 0) {
    lines.push("");
    lines.push("📋 *Rincian Item:*");
    receiptData.items.slice(0, 8).forEach((item, idx) => {
      const qtyStr = item.qty && item.qty > 1 ? ` (x${item.qty})` : "";
      const priceStr = item.price ? ` - ${formatRupiah(item.price)}` : "";
      lines.push(`${idx + 1}. ${item.name}${qtyStr}${priceStr}`);
    });

    if (receiptData.items.length > 8) {
      lines.push(`...dan ${receiptData.items.length - 8} item lainnya`);
    }
  }

  lines.push("");
  lines.push("Ada hal lain yang bisa dibantu? 🧑‍💻");

  return lines.join("\n");
}
