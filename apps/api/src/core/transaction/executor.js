import { buildBatchTransactions } from "./builder.js";
import { validateBatchPayload } from "./validator.js";
import { executeTransactionBatch } from "../../modules/transaction/repositories/transaction.repository.js";

export async function executeTransactions(user, parsedTransactions) {
  const payload = buildBatchTransactions(user, parsedTransactions);

  validateBatchPayload(payload);

  return executeTransactionBatch(user.id, payload);
}