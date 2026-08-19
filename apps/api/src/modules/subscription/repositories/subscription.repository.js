import prisma from "../../../lib/prisma.js";

export async function createOrUpdateSubscription({
  userId,
  plan,
  status = "active",
  expiredAt,
  expiresAt,
  amount = 0,
  orderId = null,
  paymentMethod = null
}) {
  const finalExpiresAt = expiresAt || expiredAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const existing = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (existing) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan,
        status,
        expiresAt: finalExpiresAt,
        ...(amount !== undefined && { amount }),
        ...(orderId && { orderId }),
        ...(paymentMethod && { paymentMethod })
      }
    });
  }

  return prisma.subscription.create({
    data: {
      userId,
      plan,
      status,
      expiresAt: finalExpiresAt,
      amount,
      orderId,
      paymentMethod
    }
  });
}

export async function findByUserId(userId) {
  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ["active", "ACTIVE", "trial", "TRIAL"] }
    },
    orderBy: { expiresAt: "desc" }
  });

  if (activeSub) return activeSub;

  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { expiresAt: "desc" }
  });
}

export async function update(userId, data) {
  const existing = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  if (!existing) {
    throw new Error("Subscription not found for user");
  }

  return prisma.subscription.update({
    where: { id: existing.id },
    data
  });
}