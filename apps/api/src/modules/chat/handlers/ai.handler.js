import { executeGemini } from "../../../lib/gemini.js";
import { getReport } from "../../report/report.service.js";
import { findWalletsByUserId } from "../../wallet/repositories/wallet.repository.js";
import { findRecentTransactions } from "../../transaction/repositories/transaction.repository.js";
import { getBudgets } from "../../budget/budget.service.js";
import { formatRupiah } from "../../../helpers/currency.helper.js";

export async function aiHandler(body, user) {
  try {
    const question = body.message || "";

    // 1. Ambil data konteks riil user
    const [wallets, reportMonth, reportWeek, recentTrx, budgets] = await Promise.all([
      findWalletsByUserId(user.id),
      getReport(user.id, "month"),
      getReport(user.id, "week"),
      findRecentTransactions(user.phone, 15, user.id),
      getBudgets(user.id)
    ]);

    const totalSaldo = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
    const walletListStr = wallets.map((w) => `${w.name}: ${formatRupiah(w.balance)}`).join(", ");
    const budgetListStr = budgets.map((b) => `${b.name}: ${b.percentage}% (Terpakai ${formatRupiah(b.spent)} dari ${formatRupiah(b.effectiveBudget)})`).join("; ");

    const trxSummary = recentTrx.map((t) => {
      return `${t.type === "INCOME" ? "+" : "-"}${formatRupiah(t.amount)} (${t.category?.name || "Umum"}: ${t.note || "-"} via ${t.wallet?.name || "Cash"})`;
    }).join("\n");

    const prompt = `
Kamu adalah "Rinci AI", asisten perencana dan penasihat keuangan pribadi yang cerdas, ramah, santun, dan sangat solutif dari Rinci.in di Indonesia.

Berikut adalah data riil kondisi keuangan pengguna (${user.name || "User"}):
- Total Saldo di Seluruh Dompet: ${formatRupiah(totalSaldo)} (${walletListStr || "Belum ada dompet"})
- Pemasukan Bulan Ini: ${formatRupiah(reportMonth.totalIncome)}
- Pengeluaran Bulan Ini: ${formatRupiah(reportMonth.totalExpense)}
- Arus Kas Bersih Bulan Ini: ${formatRupiah(reportMonth.netBalance)}
- Rincian Belanja Bulan Ini: ${JSON.stringify(reportMonth.breakdown || {})}
- Pemasukan Minggu Ini: ${formatRupiah(reportWeek.totalIncome)}
- Pengeluaran Minggu Ini: ${formatRupiah(reportWeek.totalExpense)}
- Status Budget: ${budgetListStr || "Belum mengatur budget"}
- Transaksi Terakhir:
${trxSummary || "Belum ada transaksi"}

Pertanyaan dari Pengguna:
"${question}"

INSTRUKSI JAWABAN:
1. Jawab dengan gaya santai, profesional, dan empatik khas konsultan finansial pintar Indonesia.
2. Selalu rujuk data riil di atas jika relevan (sebutkan nominal atau kategorinya secara faktual).
3. Berikan saran praktis dan actionable jika user bertanya tips berhemat atau evaluasi kebiasaan belanja.
4. Gunakan format WhatsApp yang rapi (gunakan emoji, bullet point, dan teks tebal/bold untuk angka penting).
5. Jangan terlalu panjang, padat dan to the point (maksimal 3-4 paragraf singkat).
`;

    const response = await executeGemini(async (client, model) => {
      return client.models.generateContent({
        model,
        contents: prompt
      });
    });

    const aiText = response?.text?.trim() || "Maaf, saat ini asisten AI sedang sibuk. Silakan coba tanyakan kembali sesaat lagi.";


    return {
      success: true,
      type: "AI_ADVICE",
      text: `🤖 *Rinci AI Financial Advisor*\n━━━━━━━━━━━━━━\n\n${aiText}\n\n━━━━━━━━━━━━━━\n💡 _Ada pertanyaan keuangan lain yang ingin kamu tanyakan?_`
    };
  } catch (err) {
    console.error("❌ Error in aiHandler:", err);
    return {
      success: false,
      text: "❌ Terjadi kendala saat menghubungi asisten AI. Silakan coba sesaat lagi."
    };
  }
}

