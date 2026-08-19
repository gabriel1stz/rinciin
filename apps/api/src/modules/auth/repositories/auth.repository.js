import prisma from "../../../lib/prisma.js";

/* ============================
   REFRESH TOKENS
============================ */

export async function createRefreshToken(data) {
  return prisma.refreshToken.create({ data });
}

export async function createRefreshTokenTx(tx, data) {
  return tx.refreshToken.create({ data });
}

export async function findRefreshToken(token) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function revokeRefreshToken(id) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });
}

export async function findSessionsByUserId(userId) {
  return prisma.refreshToken.findMany({
    where: { userId, revoked: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      device: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      expiresAt: true,
    },
  });
}

export async function revokeSessionById(id, userId) {
  return prisma.refreshToken.updateMany({
    where: { id, userId, revoked: false },
    data: { revoked: true },
  });
}

export async function revokeRefreshTokenByToken(token) {
  return prisma.refreshToken.updateMany({
    where: { token, revoked: false },
    data: { revoked: true },
  });
}

/* ============================
   OTP
============================ */

export async function findLastOtp(phone) {
  return prisma.otp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
}

export async function createOtp(data) {
  return prisma.otp.create({ data });
}

export async function incrementOtpAttempts(id) {
  return prisma.otp.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

export async function deleteOtpsByPhone(phone) {
  return prisma.otp.deleteMany({ where: { phone } });
}

/* ============================
   CATEGORIES
============================ */

export async function findDefaultCategory(userId) {
  return prisma.category.findFirst({
    where: { userId, isDefault: true },
  });
}

export async function createDefaultCategories(userId, categories) {
  return prisma.category.createMany({
    data: categories.map((cat) => ({
      userId,
      name: cat.name,
      icon: cat.icon,
      type: cat.type || "EXPENSE",
      isDefault: true,
    })),
    skipDuplicates: true,
  });
}

export async function createDefaultCategoriesTx(tx, userId, categories) {
  return tx.category.createMany({
    data: categories.map((cat) => ({
      userId,
      name: cat.name,
      icon: cat.icon,
      type: cat.type || "EXPENSE",
      isDefault: true,
    })),
    skipDuplicates: true,
  });
}

/* ============================
   USERS (tx variants for auth flows)
============================ */

export async function findUserByPhoneTx(tx, phone) {
  return tx.user.findUnique({ where: { phone } });
}

export async function createUserTx(tx, data) {
  return tx.user.create({ data });
}
