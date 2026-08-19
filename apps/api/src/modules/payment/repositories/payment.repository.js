import prisma from "../../../lib/prisma.js";

export async function createPayment(data) {
  return prisma.payment.create({
    data
  });
}

export async function findPaymentByOrderId(orderId) {
  return prisma.payment.findUnique({
    where: {
      orderId
    }
  });
}

export async function updatePaymentStatus(orderId, status, paidAt = null) {
  return prisma.payment.update({
    where: {
      orderId
    },
    data: {
      status,
      paidAt
    }
  });
}