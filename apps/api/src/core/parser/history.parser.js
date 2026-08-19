export function parseHistoryMessage(message = "") {
  const text = message.toLowerCase().trim();

  const result = {
    wallet: null,
    category: null,
    period: null,
    limit: 10
  };

  // =========================
  // LIMIT
  // =========================

  const number = text.match(/\d+/);

  if (number) {
    result.limit = Number(number[0]);
  }

  // =========================
  // PERIOD
  // =========================

  if (
    /hari ini|today/.test(text)
  ) {
    result.period = "today";
  }

  else if (
    /minggu ini|week/.test(text)
  ) {
    result.period = "week";
  }

  else if (
    /bulan ini|month/.test(text)
  ) {
    result.period = "month";
  }

  // =========================
  // WALLET
  // =========================

  if (/\bcash\b/.test(text))
    result.wallet = "Cash";

  else if (/\bdana\b/.test(text))
    result.wallet = "Dana";

  else if (/\bgopay\b/.test(text))
    result.wallet = "GoPay";

  else if (/\bovo\b/.test(text))
    result.wallet = "OVO";

  else if (/\bshopeepay\b|\bspay\b/.test(text))
    result.wallet = "ShopeePay";

  else if (/\bbca\b/.test(text))
    result.wallet = "BCA";

  else if (/\bbni\b/.test(text))
    result.wallet = "BNI";

  else if (/\bbri\b/.test(text))
    result.wallet = "BRI";

  else if (/\bmandiri\b/.test(text))
    result.wallet = "Mandiri";

  else if (/\bseabank\b/.test(text))
    result.wallet = "SeaBank";

  else if (/\bjago\b/.test(text))
    result.wallet = "Jago";

  // =========================
  // CATEGORY
  // =========================

  if (/makan|ayam|bakso|mie|nasi|kopi|jajan/.test(text)) {
    result.category = "Makan";
  }

  else if (/bensin|grab|gojek|tol|parkir/.test(text)) {
    result.category = "Transportasi";
  }

  else if (/belanja|minimarket|alfamart|indomaret/.test(text)) {
    result.category = "Belanja";
  }

  else if (/internet|wifi|pulsa|kuota/.test(text)) {
    result.category = "Internet & Pulsa";
  }

  else if (/listrik|air|token/.test(text)) {
    result.category = "Tagihan";
  }

  else if (/gaji|salary/.test(text)) {
    result.category = "Gaji";
  }

  return result;
}