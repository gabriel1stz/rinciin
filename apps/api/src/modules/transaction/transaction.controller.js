import {
  processTransactionMessage,
  getTransactionHistory,
  getTransactionById,
  createRestTransaction,
  updateRestTransaction,
  deleteRestTransaction,
  restoreRestTransaction,
  listTransactions,
  uploadReceiptRest,
} from "./transaction.service.js";
import { success, fail } from "../../utils/response.js";
import { normalizePhone, isValidIndonesianPhone } from "../../utils/phone.js";
import { formatTransactionText } from "../formatter/transaction.formatter.js";

export async function processTransaction(req, res) {
  try {
    const { phone, name, message } = req.body;

    if (!isValidIndonesianPhone(phone)) {
      return fail(res, "Nomor WhatsApp tidak valid", 400);
    }

    if (!message) {
      return fail(res, "Message wajib diisi", 400);
    }

    const normalizedPhone = normalizePhone(phone);
    const result = await processTransactionMessage(normalizedPhone, message, name);

    return success(res, "Transaksi diproses", {
      ...result,
      text:
        result.type === "TRANSACTION_SAVED"
          ? formatTransactionText(result)
          : null
    });
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export async function getTransactions(req, res) {
  try {
    const { phone } = req.params;
    const { limit } = req.query;

    if (!isValidIndonesianPhone(phone)) {
      return fail(res, "Nomor WhatsApp tidak valid", 400);
    }

    const transactions = await getTransactionHistory(
      normalizePhone(phone),
      limit || 20
    );

    return success(res, "Riwayat transaksi ditemukan", transactions);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export const formatTransactionSaved = formatTransactionText;

export async function listTransactionsRest(req, res) {
  try {
    const result = await listTransactions(req.user.id, req.query);

    return success(res, "Daftar transaksi", result);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export async function getTransactionRest(req, res) {
  try {
    const transaction = await getTransactionById(req.user.id, req.params.id);

    return success(res, "Detail transaksi", transaction);
  } catch (error) {
    const code = error.message === "Transaksi tidak ditemukan" ? 404 : 401;
    return fail(res, error.message, code);
  }
}

export async function createTransactionRest(req, res) {
  try {
    const { walletName, categoryName, type, amount, description, note, date, receiptUrl, tags } = req.body;

    if (!walletName) return fail(res, "walletName wajib diisi", 400);
    if (!type) return fail(res, "type wajib diisi (INCOME/EXPENSE)", 400);
    if (!amount || amount <= 0) return fail(res, "amount harus lebih dari 0", 400);

    const transaction = await createRestTransaction(req.user.id, {
      walletName,
      categoryName,
      type,
      amount,
      description,
      note,
      date,
      receiptUrl,
      tags,
    }, req.audit);

    return success(res, "Transaksi berhasil dibuat", transaction, 201);
  } catch (error) {
    return fail(res, error.message, 400);
  }
}

export async function updateTransactionRest(req, res) {
  try {
    const transaction = await updateRestTransaction(req.user.id, req.params.id, req.body, req.audit);

    return success(res, "Transaksi berhasil diperbarui", transaction);
  } catch (error) {
    const code = error.message === "Transaksi tidak ditemukan" ? 404 : 400;
    return fail(res, error.message, code);
  }
}

export async function deleteTransactionRest(req, res) {
  try {
    const transaction = await deleteRestTransaction(req.user.id, req.params.id, req.audit);

    return success(res, "Transaksi berhasil dihapus", transaction);
  } catch (error) {
    const code = error.message === "Transaksi tidak ditemukan" ? 404 : 400;
    return fail(res, error.message, code);
  }
}

export async function restoreTransactionRest(req, res) {
  try {
    const transaction = await restoreRestTransaction(req.user.id, req.params.id, req.audit);

    return success(res, "Transaksi berhasil dipulihkan", transaction);
  } catch (error) {
    const code = error.message === "Transaksi tidak ditemukan" ? 404 :
                 error.message === "Transaksi tidak dalam status terhapus" ? 409 : 400;
    return fail(res, error.message, code);
  }
}

export async function uploadReceipt(req, res) {
  try {
    let receiptUrl = req.body.receiptUrl;

    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    if (!receiptUrl) return fail(res, "receiptUrl wajib diisi", 400);

    const transaction = await uploadReceiptRest(req.user.id, req.params.id, receiptUrl, req.audit);

    return success(res, "Bukti transaksi berhasil diupload", transaction);
  } catch (error) {
    const code = error.message === "Transaksi tidak ditemukan" ? 404 : 400;
    return fail(res, error.message, code);
  }
}
