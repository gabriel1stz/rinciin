import { formatRupiah } from "../../helpers/currency.helper.js";

export function formatPaymentText(payment) {

  return `💳 Pembayaran

🆔 ${payment.orderId}
💰 ${formatRupiah(payment.amount)}
📌 ${payment.status}

Silakan selesaikan pembayaran.`;

}