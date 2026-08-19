import { formatRupiah } from "../../helpers/currency.helper.js";
import { walletIcon } from "../../helpers/wallet.helper.js";

export function formatWallet(wallets) {
  if (typeof wallets === "string") return wallets;
  const list = Array.isArray(wallets) ? wallets : (wallets?.wallets || []);

  const lines = [];

  lines.push("💳 Saldo Dompet");
  lines.push("");
  lines.push("━━━━━━━━━━━━━━");
  lines.push("");

  let total = 0;

  if (list.length === 0) {
    lines.push("Belum ada dompet terdaftar.");
  } else {
    list.forEach((wallet) => {
      const bal = Number(wallet.balance || 0);
      total += bal;

      lines.push(
        `${walletIcon(wallet.name)} ${wallet.name} • ${formatRupiah(bal)}`
      );
    });
  }

  lines.push("");
  lines.push("━━━━━━━━━━━━━━");
  lines.push("");
  lines.push(`💰 Total Saldo : ${formatRupiah(total)}`);

  return lines.join("\n");
}

export const formatWallets = formatWallet;
export const formatWalletBalanceText = formatWallet;


export function formatWalletCreatedText(wallet){

return[
"✅ Dompet berhasil dibuat",
"",
"━━━━━━━━━━━━━━",
"",
`👛 Dompet : ${wallet.name}`,
`💰 Saldo : ${formatRupiah(wallet.balance)}`,
"",
"Ada hal lain yang bisa dibantu? 🧑‍💻"
].join("\n");

}