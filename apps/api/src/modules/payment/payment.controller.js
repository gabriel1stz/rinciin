import { success, fail } from "../../utils/response.js";
import {
  createPaymentInvoice,
  processPaymentCallback,
  checkPaymentStatus,
  cancelPaymentInvoice,
  simulatePaymentInvoice
} from "./payment.service.js";

export async function createPayment(req, res) {
  try {
    const payload = {
      ...req.body,
      userId: req.user?.id || req.body?.userId || null
    };
    const result = await createPaymentInvoice(payload);
    return success(res, "Invoice berhasil dibuat", result);
  } catch (err) {
    console.error("[Payment] Create error:", err);
    return fail(res, err.message, err.status || 500);
  }
}

export async function handleCallback(req, res) {
  console.log("========== PAKASIR WEBHOOK / CALLBACK ==========");
  console.log(JSON.stringify(req.body, null, 2));
  console.log("================================================");

  try {
    const result = await processPaymentCallback(req.body);
    return res.status(200).json({
      success: true,
      message: "Webhook berhasil diproses",
      data: result
    });
  } catch (err) {
    console.error("[Payment] Webhook processing error:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

export async function getPaymentStatus(req, res) {
  try {
    const payment = await checkPaymentStatus(req.params.orderId);
    return success(res, "Status pembayaran berhasil diambil", payment);
  } catch (err) {
    console.error("[Payment] Get status error:", err);
    return fail(res, err.message, 500);
  }
}

export async function cancelPayment(req, res) {
  try {
    const result = await cancelPaymentInvoice(req.params.orderId);
    return success(res, "Transaksi berhasil dibatalkan", result);
  } catch (err) {
    console.error("[Payment] Cancel error:", err);
    return fail(res, err.message, 500);
  }
}

export async function simulatePayment(req, res) {
  try {
    const result = await simulatePaymentInvoice(req.params.orderId);
    return success(res, "Simulasi pembayaran berhasil", result);
  } catch (err) {
    console.error("[Payment] Simulate error:", err);
    return fail(res, err.message, 500);
  }
}

export async function getPlans(req, res) {
  try {
    const plans = [
      {
        id: "trial",
        name: "Trial",
        price: 0,
        period: "3 Hari",
        label: "Mulai gratis via WhatsApp",
        highlight: false,
        features: [
          "Catat transaksi harian via WA",
          "Kelola dompet & e-wallet",
          "Budget & target keuangan",
          "Laporan dasar & visual chart",
          "Akses penuh Rinci AI (3 Hari)"
        ],
        ctaText: "Mulai Trial 3 Hari"
      },

      {
        id: "pro",
        name: "Pro",
        price: 1000,
        period: "Bulan",
        label: "Untuk penggunaan pribadi",
        highlight: "PALING POPULER",
        features: [
          "Semua fitur Trial",
          "Unlimited pencatatan transaksi",
          "Advanced Reports & Insight",
          "Unlimited dompet & kategori",
          "Budget tak terbatas",
          "Akses penuh Rinci AI",
          "Export data ke Excel/CSV",
          "Pindai & OCR Struk Otomatis"
        ],
        ctaText: "Upgrade ke Pro"
      },
      {
        id: "family",
        name: "Family",
        price: 59000,
        period: "Bulan",
        label: "Untuk keluarga & tim kecil",
        highlight: false,
        features: [
          "Semua fitur Pro",
          "Hingga 5 anggota keluarga",
          "Shared Wallet & Shared Budget",
          "Laporan gabungan keluarga",
          "Audit log & transparansi",
          "Prioritas dukungan teknis",
          "Akses fitur eksperimental baru"
        ],
        ctaText: "Pilih Family"
      }
    ];

    return success(res, "Daftar plan berhasil diambil", plans);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}