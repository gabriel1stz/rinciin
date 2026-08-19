import prisma from "../../lib/prisma.js";

export async function findLatestTransaction(userId) {

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

export async function findTransactionByCode(
  userId,
  code
) {

  return prisma.transaction.findFirst({

    where: {

      userId,

      transactionCode: code

    },

    include: {

      wallet: true

    }

  });

}

export async function updateTransactionAmount(
  id,
  amount
) {

  return prisma.transaction.update({

    where: {
      id
    },

    data: {
      amount
    }

  });

}