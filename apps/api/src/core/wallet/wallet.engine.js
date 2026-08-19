const WALLET_ALIASES = {
  // E-Wallets
  shopeepay: "Shopeepay",
  "shopee pay": "Shopeepay",
  "shopee-pay": "Shopeepay",
  shopee: "Shopeepay",
  spay: "Shopeepay",
  "spay later": "Shopeepay",
  "shopeepay later": "Shopeepay",

  dana: "Dana",

  gopay: "Gopay",
  "go pay": "Gopay",
  "go-pay": "Gopay",

  ovo: "OVO",
  "o v o": "OVO",

  linkaja: "LinkAja",
  "link aja": "LinkAja",

  // Banks
  bca: "BCA",
  bni: "BNI",
  bri: "BRI",
  mandiri: "Mandiri",
  seabank: "Seabank",
  "sea bank": "Seabank",
  jago: "Bank Jago",
  "bank jago": "Bank Jago",
  jenius: "Jenius",
  bsi: "BSI",
  cimb: "CIMB",
  "cimb niaga": "CIMB",
  permata: "Permata",
  rekening: "BCA",
  rek: "BCA",
  tabungan: "BCA",

  // Cash
  cash: "Cash",
  tunai: "Cash"
};

export function normalizeWalletName(text = "") {
  const lower = String(text).toLowerCase();

  // Sort aliases by length descending so longer phrases match first (e.g. 'shopee pay' before 'shopee')
  const sortedEntries = Object.entries(WALLET_ALIASES).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [alias, wallet] of sortedEntries) {
    // Check with word boundary or clean contains
    const regex = new RegExp(`(^|\\s|[^a-z0-9])${alias}($|\\s|[^a-z0-9])`, "i");
    if (regex.test(lower) || lower.includes(alias)) {
      return wallet;
    }
  }

  return "Cash";
}

export function getAllWalletNames() {
  return [...new Set(Object.values(WALLET_ALIASES))];
}