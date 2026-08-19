export function validateTransaction(transaction) {

  if (!transaction.amount)
    return false;

  if (!transaction.categoryId)
    return false;

  return true;

}