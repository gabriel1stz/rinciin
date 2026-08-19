export function validateWalletName(name) {
  if (!name || !name.trim()) throw new Error("Nama wallet wajib diisi");
  return name.trim();
}

export function validateAmount(amount) {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) throw new Error("Nominal tidak valid");
  return num;
}

export function validateNonNegativeAmount(amount) {
  const num = Number(amount);
  if (isNaN(num) || num < 0) throw new Error("Saldo tidak valid");
  return num;
}

export function validatePagination(query) {
  return {
    page: Math.max(1, Number(query.page) || 1),
    limit: Math.min(100, Math.max(1, Number(query.limit) || 20)),
  };
}

export function assertOwnership(wallet, userId, message = "Unauthorized") {
  if (wallet.userId !== userId) throw new Error(message);
}

export async function assertNoDuplicateName(findWalletByName, userId, name, excludeId) {
  const existing = await findWalletByName(userId, name);
  if (existing && existing.id !== excludeId) throw new Error("Wallet dengan nama tersebut sudah ada");
}
