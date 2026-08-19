import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatEditText(before,after){

return[
"✏️ Transaksi berhasil diperbarui",

"",
"━━━━━━━━━━━━━━",
"",
`🆔 ID Transaksi : ${after.transactionCode}`,
`📝 Deskripsi : ${after.note}`,
`💸 Sebelum : ${formatRupiah(before.amount)}`,
`💸 Sesudah : ${formatRupiah(after.amount)}`,
`💵 Dompet : ${after.wallet.name}`,
`💰 Saldo : ${formatRupiah(after.wallet.balance)}`,
"",
"Ada hal lain yang bisa dibantu? 🧑‍💻"
].join("\n");

}

export const formatEdit=formatEditText;