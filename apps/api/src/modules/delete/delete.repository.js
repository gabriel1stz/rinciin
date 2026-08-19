import prisma from "../../lib/prisma.js";

export async function findTransactionByCode(userId, code) {
  if (!code) return null;
  return prisma.transaction.findFirst({
    where: {
      userId,
      transactionCode: code.toUpperCase()
    },
    include: {
      wallet: true,
      category: true
    }
  });
}

export async function findLatestTransaction(userId) {
  return prisma.transaction.findFirst({
    where: { userId },
    include: {
      wallet: true,
      category: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function deleteTransaction(id) {
  return prisma.transaction.delete({
    where: { id }
  });
}