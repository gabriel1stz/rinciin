export function validateWalletForTransaction(wallet, item) {
  if (!wallet) {
    throw new Error(`Wallet ${item.walletName} tidak ditemukan`);
  }

  if (item.type === "EXPENSE") {
    const nextBalance = wallet.balance - item.amount;

    if (nextBalance < 0) {
      const error = new Error(
        `Saldo ${wallet.name} tidak cukup. Saldo sekarang Rp${wallet.balance.toLocaleString("id-ID")}, transaksi Rp${item.amount.toLocaleString("id-ID")}`
      );

      error.status = 400;

      throw error;
    }
  }

  return true;
}