import { getWalletsByPhone } from "../../wallet/wallet.service.js";
import {
  formatWallets,
  formatWalletBalanceText
} from "../../formatter/wallet.formatter.js";

export async function balanceHandler(body, user) {
  try {
    const wallets = await getWalletsByPhone(user.phone);
    const text = formatWallets(wallets);

    return {
      success: true,
      intent: "GET_BALANCE",
      wallets,
      text
    };
  } catch (err) {
    return {
      success: false,
      text: `❌ Terjadi kesalahan saat memeriksa saldo: ${err.message}`
    };
  }
}
