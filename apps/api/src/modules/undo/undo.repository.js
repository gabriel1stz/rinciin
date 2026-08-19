import prisma from "../../lib/prisma.js";

export async function findLastTransaction(userId) {
  return prisma.transaction.findFirst({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      wallet: true
    }
  });
}

export async function deleteTransaction(id) {
  return prisma.transaction.delete({
    where: {
      id
    }
  });
}