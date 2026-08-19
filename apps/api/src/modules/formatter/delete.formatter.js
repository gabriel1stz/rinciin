import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatDeleteText(trx){

return[
"🗑️ Transaksi berhasil dihapus",

"",
"━━━━━━━━━━━━━━",
"",
`🆔 ID Transaksi : ${trx.transactionCode}`,
`📝 Deskripsi : ${trx.note}`,
`💸 Harga : ${formatRupiah(trx.amount)}`,
`💵 Dompet : ${trx.wallet.name}`,
`💰 Saldo : ${formatRupiah(trx.wallet.balance)}`,
"",
"Ada hal lain yang bisa dibantu? 🧑‍💻"
].join("\n");

}

export const formatDeleteTransaction=formatDeleteText;