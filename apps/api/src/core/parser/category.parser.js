export function parseCategory(text) {
  const lower = String(text).toLowerCase();

  const income =
    /(gaji|bonus|thr|komisi|profit|laba|dividen|investasi|jual|refund|cashback|masuk|pendapatan)/;

  const type = income.test(lower)
    ? "INCOME"
    : "EXPENSE";

  let categoryName = "Lainnya";
  let subCategory = "Lainnya";

  // =====================
  // INCOME
  // =====================

  if (/gaji/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Gaji Pokok";
  }

  else if (/bonus|thr/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Bonus / THR";
  }

  else if (/profit|laba/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Profit";
  }

  else if (/dividen/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Dividen";
  }

  else if (/investasi/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Investasi";
  }

  else if (/jual/.test(lower)) {
    categoryName = "Pemasukan";
    subCategory = "Penjualan";
  }

  // =====================
  // MAKAN
  // =====================

  else if (/kopi/.test(lower)) {
    categoryName = "Makan";
    subCategory = "Kopi";
  }

  else if (/ayam|bakso|mie|nasi|makan|jajan|snack|burger|pizza/.test(lower)) {
    categoryName = "Makan";
    subCategory = "Jajan / Makan di luar";
  }

  // =====================
  // TRANSPORT
  // =====================

  else if (/bensin|pertalite|pertamax|shell/.test(lower)) {
    categoryName = "Transportasi";
    subCategory = "Bensin / BBM";
  }

  else if (/grab|gojek|maxim/.test(lower)) {
    categoryName = "Transportasi";
    subCategory = "Ojek Online";
  }

  else if (/parkir/.test(lower)) {
    categoryName = "Transportasi";
    subCategory = "Parkir";
  }

  else if (/tol/.test(lower)) {
    categoryName = "Transportasi";
    subCategory = "Tol";
  }

  // =====================
  // BELANJA
  // =====================

  else if (/indomaret|alfamart|minimarket|supermarket/.test(lower)) {
    categoryName = "Belanja";
    subCategory = "Minimarket";
  }

  else if (/baju|celana|sepatu/.test(lower)) {
    categoryName = "Belanja";
    subCategory = "Fashion";
  }

  // =====================
  // TAGIHAN
  // =====================

  else if (/wifi|internet|kuota|pulsa/.test(lower)) {
    categoryName = "Tagihan";
    subCategory = "Internet & Pulsa";
  }

  else if (/listrik|token/.test(lower)) {
    categoryName = "Tagihan";
    subCategory = "Listrik";
  }

  else if (/air|pdam/.test(lower)) {
    categoryName = "Tagihan";
    subCategory = "Air";
  }

  // =====================
  // HIBURAN
  // =====================

  else if (/game|steam|epic|psn|robux|topup/.test(lower)) {
    categoryName = "Hiburan";
    subCategory = "Game";
  }

  else if (/spotify|netflix|viu|youtube/.test(lower)) {
    categoryName = "Hiburan";
    subCategory = "Subscription";
  }

  // =====================
  // KESEHATAN
  // =====================

  else if (/obat|dokter|rs|rumah sakit|vitamin/.test(lower)) {
    categoryName = "Kesehatan";
    subCategory = "Kesehatan";
  }

  return {
    categoryName,
    subCategory,
    type
  };
}