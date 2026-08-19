import { parseWalletBalance } from "../../../core/parser/wallet-balance.parser.js";
import { parseWalletUpdate } from "../../../core/parser/wallet.update.parser.js";
import { normalizeWalletName } from "../../../core/wallet/wallet.engine.js";
import {
  setWalletBalance,
  getWalletsByPhone,
  changeWalletBalance,
  transferWallet
} from "../../wallet/wallet.service.js";
import {
  formatWallets,
  formatWalletBalanceText,
  formatWalletCreatedText
} from "../../formatter/wallet.formatter.js";
import { parseWalletTransfer } from "../../../core/parser/wallet.transfer.parser.js";

function formatRupiah(n) {
  return `Rp${Number(n || 0).toLocaleString("id-ID")}`;
}

export async function walletHandler(body, user) {
  try {
    // ==========================
    // UPDATE SALDO WALLET (tambah / topup / kurangi / tarik)
    // ==========================
    if (body.intent === "UPDATE_WALLET") {
      const parsed = parseWalletUpdate(body.message);

      const wallet = await changeWalletBalance(
        user.id,
        parsed.walletName,
        parsed.amount,
        parsed.operation
      );

      return {
        success: true,
        intent: "UPDATE_WALLET",
        wallet,
        text:
          parsed.operation === "ADD"
            ? `✅ ${wallet.name} berhasil ditambah ${formatRupiah(parsed.amount)}\n\nSaldo sekarang: ${formatRupiah(wallet.balance)}`
            : `✅ ${wallet.name} berhasil dikurangi ${formatRupiah(parsed.amount)}\n\nSaldo sekarang: ${formatRupiah(wallet.balance)}`
      };
    }

    // ==========================
    // TRANSFER WALLET
    // ==========================
    if (body.intent === "TRANSFER_WALLET") {
      const parsed = parseWalletTransfer(body.message);

      const result = await transferWallet(
        user.id,
        parsed.fromWallet,
        parsed.toWallet,
        parsed.amount
      );

      return {
        success: true,
        intent: "TRANSFER_WALLET",
        wallets: [result.from, result.to],
        text: `✅ Transfer berhasil\n\n${result.from.name}: ${formatRupiah(result.from.balance)}\n↓\n${result.to.name}: ${formatRupiah(result.to.balance)}`
      };
    }

    // ==========================
    // SET SALDO WALLET
    // ==========================
    if (body.intent === "SET_WALLET") {
      const parsed = parseWalletBalance(body.message);

      const wallet = await setWalletBalance(
        user.id,
        parsed.walletName,
        parsed.balance
      );

      return {
        success: true,
        intent: "SET_WALLET",
        wallet,
        text: formatWalletCreatedText(wallet)
      };
    }

    // ==========================
    // GET SATU WALLET
    // ==========================
    if (body.intent === "GET_WALLET") {
      const wallets = await getWalletsByPhone(user.phone);

      const target = normalizeWalletName(body.message);

      const wallet = wallets.find(
        (w) => w.name.toLowerCase() === target.toLowerCase()
      );

      if (!wallet) {
        return {
          success: false,
          intent: "GET_WALLET",
          text: `❌ Dompet *${target}* belum ada atau saldonya masih kosong.\n\nKetik *${target.toLowerCase()} 100rb* untuk mengatur saldo awal.`
        };
      }

      return {
        success: true,
        intent: "GET_WALLET",
        wallets: [wallet],
        totalBalance: wallet.balance,
        text: formatWalletBalanceText({
          wallets: [wallet],
          totalBalance: wallet.balance
        })
      };
    }

    // ==========================
    // GET SEMUA WALLET
    // ==========================
    const wallets = await getWalletsByPhone(user.phone);
    const data = formatWallets(wallets);

    return {
      success: true,
      intent: "GET_BALANCE",
      ...data,
      text: formatWalletBalanceText(data)
    };
  } catch (err) {
    return {
      success: false,
      text: `❌ ${err.message}`
    };
  }
}