import prisma from "../../../lib/prisma.js";

export async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      subscription: {
        orderBy: { expiresAt: "desc" }
      },
      wallets: true
    }
  });
}

export async function findByPhone(phone) {
  if (!phone) return null;
  const clean = String(phone).replace(/\D/g, "");
  const withoutZero = clean.startsWith("0") ? clean.slice(1) : clean.startsWith("62") ? clean.slice(2) : clean;
  const withZero = "0" + withoutZero;
  const with62 = "62" + withoutZero;

  const users = await prisma.user.findMany({
    where: {
      phone: {
        in: [clean, withoutZero, withZero, with62]
      }
    },
    include: {
      subscription: {
        orderBy: { expiresAt: "desc" }
      },
      wallets: true
    },
    orderBy: { updatedAt: "desc" }
  });

  if (!users || users.length === 0) return null;

  // Prioritaskan user yang berstatus PRO / FAMILY atau memiliki subscription
  const proUser = users.find(
    (u) =>
      (u.tier && u.tier.toLowerCase() !== "free") ||
      (u.subscription &&
        u.subscription.some(
          (s) =>
            (s.plan || "").toLowerCase() === "pro" ||
            (s.plan || "").toLowerCase() === "family"
        ))
  );

  return proUser || users[0];
}


export async function createUser(data) {
  return prisma.user.create({
    data
  });
}

export async function createUserTx(tx, data) {
  return tx.user.create({ data });
}

export async function findByPhoneTx(tx, phone) {
  if (!phone) return null;
  const clean = String(phone).replace(/\D/g, "");
  const withoutZero = clean.startsWith("0") ? clean.slice(1) : clean.startsWith("62") ? clean.slice(2) : clean;
  const withZero = "0" + withoutZero;
  const with62 = "62" + withoutZero;

  return tx.user.findFirst({
    where: {
      phone: {
        in: [clean, withoutZero, withZero, with62]
      }
    }
  });
}

export async function updateUserTier(userId, tier) {
  return prisma.user.update({
    where: { id: userId },
    data: { tier }
  });
}

export async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data
  });
}