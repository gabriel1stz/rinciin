import prisma from "../../../lib/prisma.js";

export async function exportHandler(body, user) {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      deletedAt: null
    },
    include: {
      wallet: true,
      category: true
    },
    orderBy: { createdAt: "desc" }
  });

  if (!transactions.length) {
    return {
      success: false,
      text: "❌ Belum ada data transaksi yang bisa diekspor. Yuk mulai catat keuanganmu dulu!"
    };
  }

  // Build clean CSV content with UTF-8 BOM so Excel opens Indonesian text perfectly
  const headers = [
    "ID Transaksi",
    "Tanggal",
    "Tipe",
    "Kategori",
    "Sub Kategori",
    "Deskripsi / Catatan",
    "Nominal (IDR)",
    "Dompet"
  ];

  const rows = transactions.map((t) => {
    const dateStr = new Date(t.createdAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const typeStr = t.type === "INCOME" ? "PEMASUKAN" : "PENGELUARAN";
    const catStr = t.category?.name || "Umum";
    const subCatStr = t.subCategory || "-";
    const noteStr = (t.note || t.description || "-").replace(/"/g, '""');
    const amountNum = Number(t.amount || 0);
    const walletStr = t.wallet?.name || "Cash";

    return `"${t.transactionCode}","${dateStr}","${typeStr}","${catStr}","${subCatStr}","${noteStr}",${amountNum},"${walletStr}"`;
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const base64Data = Buffer.from(csvContent, "utf-8").toString("base64");
  const fileName = `Rinci-Keuangan-${new Date().toISOString().slice(0, 10)}.csv`;

  return {
    success: true,
    type: "DOCUMENT",
    document: base64Data,
    fileName,
    mimetype: "text/csv",
    text: `📊 *File Ekspor Laporan Siap!*\n━━━━━━━━━━━━━━\nTotal: *${transactions.length} transaksi* berhasil diekspor ke file CSV Spreadsheet.\n\nFile dapat langsung kamu buka di Microsoft Excel, Google Sheets, atau aplikasi Spreadsheet di HP / Laptop kamu 📂`
  };
}
