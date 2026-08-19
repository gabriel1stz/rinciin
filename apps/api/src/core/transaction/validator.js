export function validateTransactionPayload(data) {
  if (!data.userId) {
    throw new Error("User wajib ada");
  }

  if (!data.walletName) {
    throw new Error("Wallet wajib ada");
  }

  if (!data.amount || data.amount <= 0) {
    throw new Error("Nominal tidak valid");
  }

  if (!data.type) {
    throw new Error("Tipe transaksi wajib ada");
  }

  return true;
}

export function validateBatchPayload(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Tidak ada transaksi yang bisa diproses");
  }

  items.forEach(validateTransactionPayload);

  return true;
}