import { extractReceiptData } from "../../ocr/receipt.ocr.service.js";
import { executeTransactionBatch } from "../../transaction/repositories/transaction.repository.js";
import { formatReceiptText } from "../../formatter/receipt.formatter.js";
import { findWalletsByUserId } from "../../wallet/repositories/wallet.repository.js";

export async function receiptHandler(body, user) {
  const imageInput = body.image;
  const mimeType = body.mimeType || "image/jpeg";
  const caption = body.message || body.caption || "";

  if (!imageInput) {
    return {
      success: false,
      text: "❌ Gambar struk belanja tidak ditemukan."
    };
  }

  const ocrResult = await extractReceiptData(imageInput, mimeType, caption);

  if (!ocrResult.success || !ocrResult.data || !ocrResult.data.totalAmount) {
    return {
      success: false,
      text: "❌ Maaf, struk tidak terbaca dengan jelas. Pastikan foto struk terang, tidak buram, dan menampilkan total pembayaran."
    };
  }

  const data = ocrResult.data;

  // Determine target wallet
  let walletName = "Cash";
  const lowerCaption = caption.toLowerCase();
  if (/gopay/i.test(lowerCaption)) walletName = "GoPay";
  else if (/dana/i.test(lowerCaption)) walletName = "Dana";
  else if (/bca/i.test(lowerCaption)) walletName = "BCA";
  else if (/mandiri/i.test(lowerCaption)) walletName = "Mandiri";
  else if (/bri/i.test(lowerCaption)) walletName = "BRI";
  else if (/bni/i.test(lowerCaption)) walletName = "BNI";
  else if (/ovo/i.test(lowerCaption)) walletName = "OVO";
  else if (/spay|shopee/i.test(lowerCaption)) walletName = "ShopeePay";
  else if (data.paymentMethod && !/cash|tunai/i.test(data.paymentMethod)) {
    walletName = data.paymentMethod;
  }

  const itemToSave = {
    type: "EXPENSE",
    amount: data.totalAmount,
    walletName,
    categoryName: data.categoryName || "Belanja",
    subCategory: data.subCategory || "Minimarket / Supermarket",
    note: data.merchant ? `Belanja di ${data.merchant}` : data.note,
    rawText: caption || `Foto Struk: ${data.merchant}`
  };

  const batchResult = await executeTransactionBatch(user.id, [itemToSave]);
  const savedTrx = batchResult.savedTransactions[0];
  const allWallets = await findWalletsByUserId(user.id);

  return {
    success: true,
    type: "RECEIPT_SCANNED",
    transaction: savedTrx,
    receiptData: data,
    text: formatReceiptText({
      transaction: savedTrx,
      receiptData: data,
      walletBalance: savedTrx.walletBalance,
      allWallets
    })
  };
}
