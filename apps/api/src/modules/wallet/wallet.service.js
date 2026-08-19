import {
  findWalletsByPhone,
  findWalletsWithFilters,
  saveWalletBalance,
  saveWalletBalanceByPhone,
  changeWalletBalance as repositoryChangeWalletBalance,
  createWallet,
  updateWallet,
  findWalletById,
  findWalletByName,
  findWalletByIdTx,
  findWalletByNameTx,
  archiveWalletById,
  restoreWalletById,
  countWalletTransactions,
  countActiveWallets,
  adjustBalanceTx,
  findOrCreateCategoryTx,
  createTransactionTx,
} from "./repositories/wallet.repository.js";
import { transactionRepository } from "../../lib/TransactionRepository.js";
import { generateTransactionId } from "../../helpers/transaction.helper.js";
import {
  validateWalletName,
  validateAmount,
  validateNonNegativeAmount,
  validatePagination,
  assertOwnership,
  assertNoDuplicateName,
} from "./wallet.validator.js";
import crypto from "crypto";

export async function getWallets(phone) {
  return findWalletsByPhone(phone);
}

export async function saveWallet({ phone, userId, walletName, balance }) {
  validateWalletName(walletName);
  validateNonNegativeAmount(balance);
  if (phone) return saveWalletBalanceByPhone(phone, walletName, balance);
  return saveWalletBalance(userId, walletName, balance);
}

export async function create(data) {
  validateWalletName(data.name);
  return createWallet(data.userId, data);
}

export async function update(id, data) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  return updateWallet(id, wallet.userId, data);
}

export async function remove(id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  return archiveWalletById(id);
}

export async function detail(id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  return wallet;
}

export async function listWallets(userId, query) {
  const { page, limit } = validatePagination(query);

  return findWalletsWithFilters({
    userId,
    search: query.search,
    sort: query.sortBy || "createdAt",
    order: query.sortOrder || "asc",
    page,
    limit,
    includeArchived: query.includeArchived === "true",
  });
}

export async function getWalletDetail(userId, id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  assertOwnership(wallet, userId);
  return wallet;
}

export async function createWalletRest(userId, data) {
  const name = validateWalletName(data.name);
  await assertNoDuplicateName(findWalletByName, userId, name);

  return createWallet(userId, {
    name,
    type: data.type || "cash",
    balance: Math.max(0, Number(data.balance) || 0),
    icon: data.icon || null,
    color: data.color || null,
    isDefault: data.isDefault === true,
  });
}

export async function updateWalletRest(userId, id, data) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  assertOwnership(wallet, userId);

  if (data.name && data.name.trim() !== wallet.name) {
    const name = data.name.trim();
    await assertNoDuplicateName(findWalletByName, userId, name, id);
  }

  return updateWallet(id, userId, {
    ...data,
    name: data.name ? data.name.trim() : undefined,
    balance: data.balance !== undefined ? Math.max(0, Number(data.balance)) : undefined,
  });
}

export async function deleteWalletRest(userId, id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  assertOwnership(wallet, userId);

  const activeCount = await countActiveWallets(userId);
  if (activeCount <= 1) throw new Error("Tidak bisa menghapus wallet terakhir");

  const txCount = await countWalletTransactions(id);
  if (txCount > 0) throw new Error("Wallet memiliki transaksi. Arsipkan wallet sebagai gantinya.");

  return archiveWalletById(id);
}

export async function archiveWalletRest(userId, id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  assertOwnership(wallet, userId);
  if (wallet.archived) throw new Error("Wallet sudah diarsipkan");

  return archiveWalletById(id);
}

export async function restoreWalletRest(userId, id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");
  assertOwnership(wallet, userId);
  if (!wallet.archived) throw new Error("Wallet tidak dalam status arsip");

  return restoreWalletById(id);
}

async function performTransfer(userId, { fromId, fromName, toId, toName, amount, description, date }) {
  const validatedAmount = validateAmount(amount);
  const transferGroupId = crypto.randomUUID();

  return transactionRepository.transaction(async (tx) => {
    const from = fromId
      ? await findWalletByIdTx(tx, fromId)
      : await findWalletByNameTx(tx, userId, fromName);
    if (!from) throw new Error("Wallet asal tidak ditemukan");
    assertOwnership(from, userId);

    const to = toId
      ? await findWalletByIdTx(tx, toId)
      : await findWalletByNameTx(tx, userId, toName);
    if (!to) throw new Error("Wallet tujuan tidak ditemukan");
    assertOwnership(to, userId);
    if (from.id === to.id) throw new Error("Wallet asal dan tujuan tidak boleh sama");
    if (Number(from.balance) < validatedAmount) throw new Error("Saldo tidak cukup");

    await adjustBalanceTx(tx, from.id, validatedAmount, "DECREMENT");
    await adjustBalanceTx(tx, to.id, validatedAmount, "INCREMENT");

    const category = await findOrCreateCategoryTx(tx, userId, "Transfer", "EXPENSE", "\uD83D\uDD04");

    const now = date ? new Date(date) : new Date();
    const expenseTx = await createTransactionTx(tx, {
      transactionCode: generateTransactionId(),
      userId,
      walletId: from.id,
      categoryId: category.id,
      type: "EXPENSE",
      amount: validatedAmount,
      description: description || `Transfer to ${to.name}`,
      source: "TRANSFER",
      date: now,
      transferGroupId,
    });

    const incomeTx = await createTransactionTx(tx, {
      transactionCode: generateTransactionId(),
      userId,
      walletId: to.id,
      categoryId: category.id,
      type: "INCOME",
      amount: validatedAmount,
      description: description || `Transfer from ${from.name}`,
      source: "TRANSFER",
      date: now,
      transferGroupId,
    });

    return {
      from: { id: from.id, name: from.name, balance: Number(from.balance) - validatedAmount },
      to: { id: to.id, name: to.name, balance: Number(to.balance) + validatedAmount },
      amount: validatedAmount,
      transactions: [expenseTx, incomeTx],
    };
  });
}

export async function transferBetweenWalletsRest(userId, data) {
  if (!data.fromWalletId || !data.toWalletId) throw new Error("Wallet asal dan tujuan wajib diisi");
  if (data.fromWalletId === data.toWalletId) throw new Error("Wallet asal dan tujuan tidak boleh sama");

  return performTransfer(userId, {
    fromId: data.fromWalletId,
    toId: data.toWalletId,
    amount: Number(data.amount),
    description: data.description,
    date: data.date,
  });
}

export async function addBalance(userId, walletName, amount) {
  validateAmount(amount);
  return repositoryChangeWalletBalance(userId, walletName, amount, "INCREMENT");
}

export async function subtractBalance(userId, walletName, amount) {
  validateAmount(amount);
  return repositoryChangeWalletBalance(userId, walletName, amount, "DECREMENT");
}

export async function transferBetweenWallets({ userId, fromWallet, toWallet, amount }) {
  if (fromWallet === toWallet) throw new Error("Wallet asal dan tujuan tidak boleh sama");

  return performTransfer(userId, {
    fromName: fromWallet,
    toName: toWallet,
    amount: Number(amount),
  });
}

export const getWalletsByPhone = getWallets;
export const setWalletBalance = saveWallet;
export const addWalletBalance = addBalance;
export const subtractWalletBalance = subtractBalance;
export const transferWallet = transferBetweenWallets;

export async function changeWalletBalance(userId, walletName, amount, operation) {
  if (operation === "ADD") return addBalance(userId, walletName, amount);
  return subtractBalance(userId, walletName, amount);
}
