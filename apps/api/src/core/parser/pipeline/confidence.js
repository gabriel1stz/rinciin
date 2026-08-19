export function calculateConfidence({
  amount,
  wallet,
  category
}) {

  let score = 0;

  if (amount) score += 40;

  if (wallet) score += 30;

  if (category) score += 30;

  return score;

}