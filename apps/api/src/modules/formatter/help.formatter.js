export function formatHelpText() {
  const loginUrl = process.env.WEB_LOGIN_URL || "https://gabriel1stz-rinciinn.vercel.app/login";

  return `👋 *PANDUAN LENGKAP RINCI.IN*
━━━━━━━━━━━━━━
Berikut perintah & cara penggunaan yang bisa kamu coba:

💸 *1. CATAT TRANSAKSI*
• *makan 25rb* _(default Cash)_
• *bensin 50rb gopay*
• *kopi 35rb shopeepay*
• *gaji 5jt bca* _(pemasukan)_
• *makan 20rb sama bensin 30rb* _(multi-catat)_

👛 *2. KELOLA DOMPET & SALDO*
• *saldo* _(cek semua dompet & total saldo)_
• *saldo shopeepay* _(cek saldo satu dompet)_
• *top up gopay 100rb* _(tambah saldo)_
• *tarik bca 50rb* _(kurangi saldo)_
• *transfer bca ke shopeepay 200rb* _(pindah dana)_
• *shopeepay 500rb* _(atur saldo awal)_

📸 *3. SCAN STRUK & SUARA*
• Kirim *Foto Struk / Nota* 🧾 untuk auto-scan OCR
• Kirim *Voice Note* 🎙️ _"Beli pulsa 50 ribu dana"_

📊 *4. ANGGARAN (BUDGET)*
• *budget makan 1.5jt*
• *lihat budget*

📈 *5. LAPORAN & RIWAYAT*
• *laporan hari ini*
• *laporan minggu ini*
• *laporan bulan ini*
• *history* _(10 transaksi terakhir)_
• *ekspor* _(unduh file CSV Excel)_

🤖 *6. TANYA ASISTEN AI*
• *tanya apakah saya boros bulan ini?*
• *saran cara menabung untuk beli motor*

🌐 *7. WEB DASHBOARD*
• Akses grafik & kelola lengkap di:
👉 ${loginUrl}

Ketik perintah di atas kapan saja! 🚀`;
}