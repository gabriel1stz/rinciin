import prisma from "./prisma.js";

export const transactionRepository = {
  transaction(fn) {
    return prisma.$transaction(fn);
  },
};
