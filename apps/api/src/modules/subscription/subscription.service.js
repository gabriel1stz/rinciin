import * as repository from "./repositories/subscription.repository.js";
import { findByPhone } from "../user/user.service.js";

function getExpiredDate(plan) {
  if (plan === "TRIAL") return null;

  const date = new Date();

  if (plan === "PRO") {
    date.setMonth(date.getMonth() + 1);
  } else if (plan === "FAMILY") {
    date.setMonth(date.getMonth() + 12);
  }

  return date;
}

export async function activateSubscription(userId, plan) {
  const expiredAt = getExpiredDate(plan);

  const current = await repository.findByUserId(userId);

  if (!current) {
    return repository.create({
      userId,
      plan,
      status: "ACTIVE",
      startedAt: new Date(),
      expiredAt
    });
  }

  return repository.update(userId, {
    plan,
    status: "ACTIVE",
    startedAt: new Date(),
    expiredAt
  });
}

export async function activateSubscriptionByPhone(phone, plan) {
  const user = await findByPhone(phone);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  return activateSubscription(
    user.id,
    plan.toUpperCase()
  );
}

export async function getSubscriptionByPhone(phone) {
  const user = await findByPhone(phone);

  if (!user) {
    return null;
  }

  return repository.findByUserId(user.id);
}

export async function getUserSubscription(userId) {
  return repository.findByUserId(userId);
}