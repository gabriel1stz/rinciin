import { executeGemini } from "../../lib/gemini.js";
import { formatRupiah } from "../../helpers/currency.helper.js";

/**
 * Extract structured transaction details from a receipt image buffer
 * @param {Buffer|string} imageInput - Buffer or Base64 string of receipt image
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @param {string} caption - Optional text caption from WhatsApp message
 */
export async function extractReceiptData(imageInput, mimeType = "image/jpeg", caption = "") {
  try {
    const base64Data = Buffer.isBuffer(imageInput)
      ? imageInput.toString("base64")
      : imageInput;

    const prompt = `
Kamu adalah asisten OCR cerdas untuk aplikasi pencatatan keuangan "Rinci.in" di Indonesia.
Tugasmu adalah membaca dan mengekstrak data dari foto struk belanja / nota kasir / invoice / bukti transfer berikut.

PENTING:
- Ekstrak nama toko / merchant (contoh: Indomaret, Alfamart, SPBU Pertamina, Starbucks, Kopi Kenangan, RM Padang Sederhana).
- Ekstrak total nominal yang dibayar (Grand Total / Total Akhir setelah diskon dan pajak).
- Kategorikan pengeluaran ke dalam salah satu kategori:
  - "Belanja" (Sub: Minimarket, Supermarket, Fashion, Elektronik, Kebutuhan Rumah)
  - "Makan" (Sub: Jajan / Makan di luar, Kopi, Restoran, Makanan Ringan)
  - "Transportasi" (Sub: Bensin / BBM, Parkir, Ojek Online, Tol)
  - "Kesehatan" (Sub: Obat / Apotek, Dokter, Vitamin)
  - "Tagihan" (Sub: Listrik, Air, Internet & Pulsa)
  - "Lainnya"
- Deteksi metode pembayaran jika tertulis (contoh: QRIS, GoPay, BCA, Mandiri, Cash, ShopeePay, OVO).
- Jika ada caption tambahan dari user: "${caption}", gunakan petunjuk dari caption untuk nama dompet atau catatan tambahan.

KEMBALIKAN HANYA JSON VALID (tanpa markdown blok \`\`\`json):
{
  "merchant": "Nama Toko/Merchant",
  "totalAmount": 45000,
  "items": [
    { "name": "Nama Barang", "qty": 1, "price": 45000 }
  ],
  "categoryName": "Belanja",
  "subCategory": "Minimarket / Supermarket",
  "paymentMethod": "GoPay",
  "note": "Ringkasan barang belanjaan",
  "date": "2026-08-15"
}
`;

    const response = await executeGemini(async (client, model) => {
      return client.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              },
              { text: prompt }
            ]
          }
        ]
      });
    });

    let rawText = response.text || "";
    // Clean up potential markdown formatting ```json ... ```
    rawText = rawText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawText);

    return {
      success: true,
      data: {
        merchant: parsed.merchant || "Struk Belanja",
        totalAmount: Number(parsed.totalAmount || 0),
        items: Array.isArray(parsed.items) ? parsed.items : [],
        categoryName: parsed.categoryName || "Belanja",
        subCategory: parsed.subCategory || "Lainnya",
        paymentMethod: parsed.paymentMethod || "Cash",
        note: parsed.note || parsed.merchant || "Belanja",
        date: parsed.date || new Date().toISOString()
      }
    };
  } catch (err) {
    console.error("❌ Error in extractReceiptData:", err);
    return {
      success: false,
      error: err.message
    };
  }
}
