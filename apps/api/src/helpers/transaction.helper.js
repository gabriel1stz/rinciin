import crypto from "crypto";

export function generateTransactionId() {
  return "RIN-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}