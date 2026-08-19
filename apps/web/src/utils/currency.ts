// currency.ts
/**
 * Format number to standard Indonesian Rupiah (e.g. Rp45.250.000, Rp0, -Rp250.000)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp0';
  }

  const num = Math.round(Number(amount));
  const formatted = Math.abs(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return num < 0 ? `-Rp${formatted}` : `Rp${formatted}`;
}

/**
 * Format currency with explicit +/- sign (e.g. +Rp15.000.000, -Rp55.000)
 */
export function formatSignedCurrency(
  amount: number | string | null | undefined,
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' = 'INCOME'
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp0';
  }

  const num = Math.abs(Number(amount) || 0);
  const formatted = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (type === 'INCOME') {
    return `+Rp${formatted}`;
  }
  if (type === 'EXPENSE') {
    return `-Rp${formatted}`;
  }
  return `Rp${formatted}`;
}
