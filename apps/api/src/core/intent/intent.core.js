export const Intent = {
  // ==========================
  // TRANSACTION
  // ==========================
  CREATE_TRANSACTION: "CREATE_TRANSACTION",
  EDIT_TRANSACTION: "EDIT_TRANSACTION",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",
  UNDO: "UNDO",

  // ==========================
  // WALLET
  // ==========================
  GET_BALANCE: "GET_BALANCE",
  GET_WALLET: "GET_WALLET",
  SET_WALLET: "SET_WALLET",
  TRANSFER_WALLET: "TRANSFER_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET",

  // ==========================
  // REPORT
  // ==========================
  GET_REPORT: "GET_REPORT",
  GET_REPORT_TODAY: "GET_REPORT_TODAY",
  GET_REPORT_WEEK: "GET_REPORT_WEEK",
  GET_REPORT_MONTH: "GET_REPORT_MONTH",

  // ==========================
  // BUDGET
  // ==========================
  SET_BUDGET: "SET_BUDGET",
  GET_BUDGET: "GET_BUDGET",

  // ==========================
  // HISTORY
  // ==========================
  GET_HISTORY: "GET_HISTORY",

  // ==========================
  // SYSTEM
  // ==========================
  HELP: "HELP",
  EXPORT: "EXPORT",
  ASK_AI: "ASK_AI",
  UNKNOWN: "UNKNOWN",


  // ==========================
  // FUTURE
  // ==========================
  GET_STATISTIC: "GET_STATISTIC",
  GET_PROFILE: "GET_PROFILE",
  GET_PREMIUM: "GET_PREMIUM",
};

export function detectIntent(text = "") {
  const msg = text.toLowerCase().trim();

  // ==========================
  // HELP
  // ==========================
  if (/^(help|menu|bantuan)$/i.test(msg)) {
    return Intent.HELP;
  }

  // ==========================
  // TRANSFER
  // transfer dana ke bca 200rb
  // pindah gopay ke cash 50rb
  // ==========================
  if (/^(transfer|pindah)/i.test(msg)) {
    return Intent.TRANSFER_WALLET;
  }

  // Check whether message contains digits or spoken number words
  const hasAmount =
    /\d|sejuta|seratus|seribu|sepuluh|sebelas|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|belas|puluh|ratus|ribu|juta|setengah/i.test(
      msg
    );

  // ==========================
  // UPDATE WALLET (tambah / kurangi / top up / saldo + nominal / kata angka)
  // tambah dana 100rb
  // kurangi cash 50rb
  // isi dana 500rb
  // isi saldo gopay 50rb
  // topup gopay 200rb
  // top up gopay 200rb
  // top up saldo shopeepay 50rb
  // saldo gopay 50rb
  // saldo dana dua juta
  // saldo bca 100k
  // saldo 50rb
  // tarik bca 100rb
  // ==========================
  if (
    /^(tambah|kurangi|isi|top\s*up|topup|tarik|saldo|isi\s*saldo|top\s*up\s*saldo)/i.test(msg) &&
    hasAmount &&
    !/^(saldo|dompet|cek\s+saldo|lihat\s+saldo)$/i.test(msg)
  ) {
    // Exclude if it's purely "saldo <wallet>" without any actual number tokens
    const isPureGetWallet = /^(saldo|wallet|dompet|cek|lihat)\s+(cash|tunai|dana|gopay|ovo|shopeepay|shopee\s*pay|spay|shopee|linkaja|bca|bni|bri|mandiri|seabank|jago|bank\s*jago|jenius|bsi|cimb|permata)$/i.test(msg);
    if (!isPureGetWallet) {
      return Intent.UPDATE_WALLET;
    }
  }

  // ==========================
  // SET WALLET (set / atur saldo awal)
  // set saldo dana 2jt
  // atur saldo bca 5jt
  // ==========================
  if (
    /^(set\s*saldo|atur\s*saldo|ganti\s*saldo|reset\s*saldo)/i.test(msg) &&
    hasAmount
  ) {
    return Intent.SET_WALLET;
  }

  // ==========================
  // SATU WALLET
  // saldo dana
  // cek bca
  // lihat gopay
  // cek shopeepay
  // ==========================
  if (
    /^(saldo|wallet|dompet|cek|lihat)\s+(cash|tunai|dana|gopay|ovo|shopeepay|shopee\s*pay|spay|shopee|linkaja|bca|bni|bri|mandiri|seabank|jago|bank\s*jago|jenius|bsi|cimb|permata)$/i.test(msg)
  ) {
    return Intent.GET_WALLET;
  }

  // ==========================
  // SEMUA WALLET
  // ==========================
  if (
    /^(saldo|wallet|dompet)$/i.test(msg) ||
    /^(cek|lihat)\s+(saldo|wallet|dompet)$/i.test(msg) ||
    /^(saldo|wallet|dompet)\s+saya$/i.test(msg)
  ) {
    return Intent.GET_BALANCE;
  }

  // ==========================
  // BUDGET
  // ==========================
  if (/^budget\s+/i.test(msg)) {
    return Intent.SET_BUDGET;
  }

  if (/(lihat budget|cek budget|budget saya|budgetku)/i.test(msg)) {
    return Intent.GET_BUDGET;
  }

  // ==========================
  // HISTORY
  // ==========================
  if (/^(\d+\s+)?(history|riwayat|transaksi)/i.test(msg)) {
    return Intent.GET_HISTORY;
  }

  // ==========================
  // EXPORT
  // ==========================
  if (/^(ekspor|export|unduh|download)/i.test(msg)) {
    return Intent.EXPORT;
  }

  // ==========================
  // REPORT
  // ==========================
  if (/laporan hari ini|ringkasan hari ini/i.test(msg)) {
    return Intent.GET_REPORT_TODAY;
  }

  if (/laporan minggu|ringkasan minggu/i.test(msg)) {
    return Intent.GET_REPORT_WEEK;
  }

  if (/laporan bulan|ringkasan bulan/i.test(msg)) {
    return Intent.GET_REPORT_MONTH;
  }

  if (/laporan|ringkasan/i.test(msg)) {
    return Intent.GET_REPORT;
  }

  // ==========================
  // UNDO
  // ==========================
  if (/^(undo|batal)$/i.test(msg)) {
    return Intent.UNDO;
  }

  // ==========================
  // EDIT TRANSACTION
  // ubah transaksi
  // edit transaksi
  // ==========================
  if (/^(ubah|edit)/i.test(msg)) {
    return Intent.EDIT_TRANSACTION;
  }


  // ==========================
  // ASK AI / FINANCIAL ADVISOR
  // ==========================
  if (
    /^(tanya|ai|boros|tips|saran|analisis|evaluasi)/i.test(msg) ||
    /\b(kenapa|bagaimana|gimana|apakah|saran|rekomendasi)\b/i.test(msg) ||
    /\?$/.test(msg)
  ) {
    return Intent.ASK_AI;
  }

  // ==========================
  // DEFAULT
  // ==========================
  return Intent.CREATE_TRANSACTION;
}