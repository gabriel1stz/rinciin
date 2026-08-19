import prisma from "../../../lib/prisma.js";

async function getUserByPhone(phone) {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new Error("User tidak ditemukan");
  return user;
}

export async function findWalletsByPhone(phone) {
  if (!phone) return [];
  const clean = String(phone).replace(/\D/g, "");
  const withoutZero = clean.startsWith("0") ? clean.slice(1) : clean.startsWith("62") ? clean.slice(2) : clean;
  const withZero = "0" + withoutZero;
  const with62 = "62" + withoutZero;

  const user = await prisma.user.findFirst({
    where: {
      phone: { in: [clean, withoutZero, withZero, with62] }
    },
    orderBy: [
      { tier: "desc" },
      { updatedAt: "desc" }
    ]
  });

  if (!user) return [];

  return prisma.wallet.findMany({
    where: {
      userId: user.id,
      archived: false,
    },
    orderBy: { createdAt: "asc" },
  });
}


export async function findWalletByName(userId, walletName) {
  if (!walletName) return null;
  return prisma.wallet.findFirst({
    where: {
      userId,
      name: { equals: walletName.trim(), mode: "insensitive" },
      archived: false,
    },
    orderBy: { createdAt: "asc" },
  });
}


export async function findWalletsByUserId(userId) {
  return prisma.wallet.findMany({
    where: { userId, archived: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function findWalletsWithFilters({ userId, search, sort, order, page, limit, includeArchived }) {
  const where = { userId };

  if (!includeArchived) where.archived = false;

  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const total = await prisma.wallet.count({ where });
  const wallets = await prisma.wallet.findMany({
    where,
    orderBy: { [sort || "createdAt"]: order || "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { wallets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findWalletById(id) {
  return prisma.wallet.findUnique({ where: { id } });
}

export async function findWalletByIdTx(tx, id) {
  return tx.wallet.findUnique({ where: { id } });
}

export async function findWalletByNameTx(tx, userId, name) {
  if (!name) return null;
  return tx.wallet.findFirst({
    where: {
      userId,
      name: { equals: name.trim(), mode: "insensitive" },
      archived: false,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function countWalletTransactions(walletId) {
  return prisma.transaction.count({ where: { walletId, deletedAt: null } });
}

export async function countActiveWallets(userId) {
  return prisma.wallet.count({ where: { userId, archived: false } });
}

export async function adjustWalletBalance(id, amount) {
  return prisma.wallet.update({
    where: { id },
    data: { balance: { increment: amount } }
  });
}

export async function adjustWalletBalanceTx(tx, id, amount) {
  return tx.wallet.update({
    where: { id },
    data: { balance: { increment: amount } }
  });
}

export async function adjustBalanceTx(tx, id, amount, operation) {
  return tx.wallet.update({
    where: { id },
    data: { balance: operation === "INCREMENT" ? { increment: amount } : { decrement: amount } },
  });
}

export async function unsetOtherDefaultsTx(tx, userId, excludeId) {
  await tx.wallet.updateMany({
    where: { userId, isDefault: true, id: { not: excludeId } },
    data: { isDefault: false },
  });
}

export async function findOrCreateCategoryTx(tx, userId, name, type, icon) {
  let category = await tx.category.findFirst({
    where: { userId, name },
  });
  if (!category) {
    category = await tx.category.create({
      data: { userId, name, type, icon, isDefault: false },
    });
  }
  return category;
}

export async function createTransactionTx(tx, data) {
  return tx.transaction.create({ data });
}

export async function saveWalletBalance(userId, walletName, balance) {
  const existing = await findWalletByName(userId, walletName);
  if (existing) {
    return prisma.wallet.update({
      where: { id: existing.id },
      data: { balance },
    });
  }

  return prisma.wallet.create({
    data: {
      userId,
      name: walletName.trim(),
      balance,
      type: walletName.toLowerCase() === "cash" ? "cash" : "ewallet",
      isDefault: false,
    },
  });
}


export async function saveWalletBalanceByPhone(phone, walletName, balance) {
  const user = await getUserByPhone(phone);
  return saveWalletBalance(user.id, walletName, balance);
}

export async function changeWalletBalance(userId, walletName, amount, type) {
  let wallet = await findWalletByName(userId, walletName);

  if (!wallet) {
    if (type === "DECREMENT") {
      throw new Error(`Dompet ${walletName} belum dibuat.`);
    }

    return prisma.wallet.create({
      data: {
        userId,
        name: walletName,
        balance: amount,
        type: walletName.toLowerCase() === "cash" ? "cash" : "ewallet",
        isDefault: false
      }
    });
  }

  if (type === "DECREMENT" && Number(wallet.balance) < amount) {
    throw new Error(`Saldo ${walletName} tidak mencukupi (saat ini Rp${Number(wallet.balance).toLocaleString("id-ID")})`);
  }

  return adjustBalanceTx(prisma, wallet.id, amount, type);
}


export async function createWallet(userId, data) {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await unsetOtherDefaultsTx(tx, userId, "__new__");
    }

    return tx.wallet.create({
      data: {
        userId,
        name: data.name,
        type: data.type || "cash",
        balance: data.balance ?? 0,
        icon: data.icon || null,
        color: data.color || null,
        isDefault: data.isDefault || false,
      },
    });
  });
}

export async function updateWallet(id, userId, data) {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await unsetOtherDefaultsTx(tx, userId, id);
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.balance !== undefined) updateData.balance = data.balance;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.archived !== undefined) updateData.archived = data.archived;

    return tx.wallet.update({ where: { id }, data: updateData });
  });
}

export async function archiveWalletById(id) {
  return prisma.wallet.update({
    where: { id },
    data: { archived: true, archivedAt: new Date() },
  });
}

export async function restoreWalletById(id) {
  const wallet = await findWalletById(id);
  if (!wallet) throw new Error("Wallet tidak ditemukan");

  return prisma.$transaction(async (tx) => {
    if (wallet.isDefault) {
      await unsetOtherDefaultsTx(tx, wallet.userId, id);
    }

    return tx.wallet.update({
      where: { id },
      data: { archived: false, archivedAt: null },
    });
  });
}

export async function transferWallet(userId, fromWallet, toWallet, amount) {
  return prisma.$transaction(async (tx) => {
    const from = await tx.wallet.findUnique({
      where: { userId_name: { userId, name: fromWallet } },
    });
    if (!from) throw new Error("Wallet asal tidak ditemukan");

    const to = await tx.wallet.findUnique({
      where: { userId_name: { userId, name: toWallet } },
    });
    if (!to) throw new Error("Wallet tujuan tidak ditemukan");
    if (Number(from.balance) < amount) throw new Error("Saldo tidak cukup");

    await adjustBalanceTx(tx, from.id, amount, "DECREMENT");
    await adjustBalanceTx(tx, to.id, amount, "INCREMENT");

    return {
      from: { id: from.id, name: from.name, balance: Number(from.balance) - amount },
      to: { id: to.id, name: to.name, balance: Number(to.balance) + amount },
      amount,
    };
  });
}
