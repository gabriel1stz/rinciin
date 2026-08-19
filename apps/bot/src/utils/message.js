import { rupiah } from "./format.js";
import { getEmoji } from "./emoji.js";

export function successExpense(data){

return `✅ *Transaksi Berhasil*

━━━━━━━━━━━━━━━━━━

${getEmoji(data.category)} Kategori

${data.category}

💸 Nominal

${rupiah(data.amount)}

👛 Wallet

${data.wallet}

📝 Catatan

${data.note}

━━━━━━━━━━━━━━━━━━

🎉 Pengeluaran berhasil disimpan.
`;

}

export function successIncome(data){

return `🎉 *Pemasukan Berhasil*

━━━━━━━━━━━━━━━━━━

💼 Kategori

${data.category}

💰 Nominal

${rupiah(data.amount)}

👛 Wallet

${data.wallet}

━━━━━━━━━━━━━━━━━━

Saldo bertambah 🚀
`;

}