import { processPaymentCallback } from "../payment.service.js";

export async function processWebhook(payload) {
  return processPaymentCallback(payload);
}