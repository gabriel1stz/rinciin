import prisma from "../../../lib/prisma.js";
import { validateWalletForTransaction } from "../../../core/wallet/wallet.rule.js";
import { generateTransactionId } from "../../../helpers/transaction.helper.js";

export async function executeTransactionBatch(userId, items) {
  return prisma.$transaction(async (tx) => {
    const savedTransactions = [];
    const updatedWallets = [];

    for (const item of items) {
      let wallet = await tx.wallet.findFirst({
        where: {
          userId,
          name: {
            equals: item.walletName,
            mode: "insensitive"
          }
        }
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            name: item.walletName,
            balance: 0
          }
        });
      }

      validateWalletForTransaction(wallet, item);

      let category = await tx.category.findFirst({
        where: {
          name: {
            equals: item.categoryName,
            mode: "insensitive"
          }
        }
      });

      if (!category) {
        category = await tx.category.create({
          data: {
            name: item.categoryName,
            type: item.type
          }
        });
      }

      const balanceAfter =
        item.type === "INCOME"
          ? wallet.balance + item.amount
          : wallet.balance - item.amount;

      const transaction = await tx.transaction.create({
        data: {
          transactionCode: generateTransactionId(),
          userId,
          walletId: wallet.id,
          categoryId: category.id,
          type: item.type,
          amount: item.amount,
          note: item.note,
          subCategory: item.subCategory,
          rawText: item.rawText
        },
        include: {
          wallet: true,
          category: true
        }
      });

      const updatedWallet = await tx.wallet.update({
        where: {
          id: wallet.id
        },
        data: {
          balance: balanceAfter
        }
      });

      savedTransactions.push({
        ...transaction,
        walletName: updatedWallet.name,
        walletBalance: updatedWallet.balance,
        categoryName: category.name,
        categoryType: category.type,
        subCategory: item.subCategory
      });
      updatedWallets.push(updatedWallet);
    }

    return {
      savedTransactions,
      updatedWallets
    };
  });
}

export async function findById(id, includeDeleted = false) {
  const where = { id };
  if (!includeDeleted) where.deletedAt = null;

  return prisma.transaction.findUnique({
    where,
    include: { wallet: true, category: true }
  });
}

export async function createTransaction(userId, data) {
  const transactionCode = generateTransactionId();

  return prisma.transaction.create({
    data: {
      transactionCode,
      userId,
      walletId: data.walletId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      note: data.note || null,
      source: "web",
      date: data.date ? new Date(data.date) : undefined,
      receiptUrl: data.receiptUrl || null,
      tags: data.tags || []
    },
    include: { wallet: true, category: true }
  });
}

export async function createTransactionTx(tx, userId, data) {
  const transactionCode = generateTransactionId();

  return tx.transaction.create({
    data: {
      transactionCode,
      userId,
      walletId: data.walletId,
      categoryId: data.categoryId,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      note: data.note || null,
      source: "web",
      date: data.date ? new Date(data.date) : undefined,
      receiptUrl: data.receiptUrl || null,
      tags: data.tags || []
    },
    include: { wallet: true, category: true }
  });
}

export async function updateTransaction(id, data) {
  return prisma.transaction.update({
    where: { id },
    data: {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.walletId !== undefined && { walletId: data.walletId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl }),
      ...(data.tags !== undefined && { tags: data.tags })
    },
    include: { wallet: true, category: true }
  });
}

export async function updateTransactionTx(tx, id, data) {
  return tx.transaction.update({
    where: { id },
    data: {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.note !== undefined && { note: data.note }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.walletId !== undefined && { walletId: data.walletId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl }),
      ...(data.tags !== undefined && { tags: data.tags })
    },
    include: { wallet: true, category: true }
  });
}

export async function deleteTransactionById(id) {
  return prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

export async function deleteTransactionByIdTx(tx, id) {
  return tx.transaction.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
}

export async function restoreTransactionById(id) {
  return prisma.transaction.update({
    where: { id },
    data: { deletedAt: null }
  });
}

export async function restoreTransactionByIdTx(tx, id) {
  return tx.transaction.update({
    where: { id },
    data: { deletedAt: null }
  });
}

export async function findByIdTx(tx, id, includeDeleted = false) {
  const where = { id };
  if (!includeDeleted) where.deletedAt = null;

  return tx.transaction.findUnique({
    where,
    include: { wallet: true, category: true }
  });
}

export async function findTransactionsWithFilters({
  userId,
  search,
  type,
  walletId,
  categoryId,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  sort = "date",
  order = "desc",
  page = 1,
  limit = 20,
  includeDeleted = false
}) {
  const where = { userId };

  if (!includeDeleted) where.deletedAt = null;

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { note: { contains: search, mode: "insensitive" } },
      { rawText: { contains: search, mode: "insensitive" } }
    ];
  }

  if (type) where.type = type;
  if (walletId) where.walletId = walletId;
  if (categoryId) where.categoryId = categoryId;

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    where.amount = {};
    if (minAmount) where.amount.gte = Number(minAmount);
    if (maxAmount) where.amount.lte = Number(maxAmount);
  }

  const skip = (page - 1) * limit;
  const orderBy = {};
  orderBy[sort] = order;

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { wallet: true, category: true },
      orderBy,
      skip,
      take: Number(limit)
    }),
    prisma.transaction.count({ where })
  ]);

  return {
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function findTransactions({
  phone,
  userId = null,
  wallet = null,
  category = null,
  period = null,
  limit = 10,
  includeDeleted = false
}) {
  let targetUserId = userId;

  if (!targetUserId && phone) {
    const clean = String(phone).replace(/\D/g, "");
    const withoutZero = clean.startsWith("0") ? clean.slice(1) : clean.startsWith("62") ? clean.slice(2) : clean;
    const withZero = "0" + withoutZero;
    const with62 = "62" + withoutZero;

    const user = await prisma.user.findFirst({
      where: { phone: { in: [clean, withoutZero, withZero, with62] } },
      orderBy: [{ tier: "desc" }, { updatedAt: "desc" }]
    });

    if (user) targetUserId = user.id;
  }

  const where = {};
  if (targetUserId) {
    where.userId = targetUserId;
  } else if (phone) {
    where.user = { phone };
  }

  if (!includeDeleted) where.deletedAt = null;

  if (wallet) {
    where.wallet = {
      name: { equals: wallet, mode: "insensitive" }
    };
  }

  if (category) {
    where.category = {
      name: { equals: category, mode: "insensitive" }
    };
  }

  if (period) {
    const start = new Date();

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
    } else if (period === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    }

    where.createdAt = { gte: start };
  }

  return prisma.transaction.findMany({
    where,
    include: { wallet: true, category: true },
    orderBy: { createdAt: "desc" },
    take: Number(limit)
  });
}

export async function findRecentTransactions(phone, limit = 10, userId = null) {
  return findTransactions({ phone, userId, limit });
}

export async function findTransactionsByPhone(phone, limit = 20, userId = null) {
  return findTransactions({ phone, userId, limit });
}

