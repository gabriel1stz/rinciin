import * as WalletService from "./wallet.service.js";
import { success, fail } from "../../utils/response.js";

export async function getWallets(req, res, next) {
  try {
    const { phone } = req.params;
    const wallets = await WalletService.getWallets(phone);
    return res.json({ success: true, data: wallets });
  } catch (err) {
    next(err);
  }
}

export async function saveWallet(req, res, next) {
  try {
    const result = await WalletService.saveWallet(req.body);
    return res.json({ success: true, message: "Wallet berhasil disimpan.", data: result });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const wallet = await WalletService.create(req.body);
    res.json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const wallet = await WalletService.update(req.params.id, req.body);
    res.json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await WalletService.remove(req.params.id);
    res.json({ success: true, message: "Wallet berhasil dihapus." });
  } catch (err) {
    next(err);
  }
}

export async function detail(req, res, next) {
  try {
    const wallet = await WalletService.detail(req.params.id);
    res.json({ success: true, data: wallet });
  } catch (err) {
    next(err);
  }
}

export async function addBalance(req, res, next) {
  try {
    const { userId, walletName, amount } = req.body;
    const result = await WalletService.addBalance(userId, walletName, Number(amount));
    return res.json({ success: true, message: "Saldo berhasil ditambahkan.", data: result });
  } catch (err) {
    next(err);
  }
}

export async function subtractBalance(req, res, next) {
  try {
    const { userId, walletName, amount } = req.body;
    const result = await WalletService.subtractBalance(userId, walletName, Number(amount));
    return res.json({ success: true, message: "Saldo berhasil dikurangi.", data: result });
  } catch (err) {
    next(err);
  }
}

export async function transferWallet(req, res, next) {
  try {
    const result = await WalletService.transferBetweenWallets({
      userId: req.body.userId,
      fromWallet: req.body.fromWallet,
      toWallet: req.body.toWallet,
      amount: Number(req.body.amount),
    });
    return res.json({ success: true, message: "Transfer berhasil.", data: result });
  } catch (err) {
    next(err);
  }
}

export async function listWalletsRest(req, res) {
  try {
    const result = await WalletService.listWallets(req.user.id, req.query);
    return success(res, "Daftar wallet", result);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export async function getWalletRest(req, res) {
  try {
    const wallet = await WalletService.getWalletDetail(req.user.id, req.params.id);
    return success(res, "Detail wallet", wallet);
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 : 400;
    return fail(res, error.message, code);
  }
}

export async function createWalletRest(req, res) {
  try {
    const { name, type, balance, icon, color, isDefault } = req.body;
    if (!name) return fail(res, "Nama wallet wajib diisi", 400);

    const wallet = await WalletService.createWalletRest(req.user.id, { name, type, balance, icon, color, isDefault });

    await req.audit({
      action: "CREATE_WALLET",
      entityType: "Wallet",
      entityId: wallet.id,
      after: { name: wallet.name, type: wallet.type, balance: Number(wallet.balance), isDefault: wallet.isDefault },
    });

    return success(res, "Wallet berhasil dibuat", wallet, 201);
  } catch (error) {
    const code = error.message.includes("sudah ada") ? 409 : 400;
    return fail(res, error.message, code);
  }
}

export async function updateWalletRest(req, res) {
  try {
    const before = await WalletService.getWalletDetail(req.user.id, req.params.id);
    const wallet = await WalletService.updateWalletRest(req.user.id, req.params.id, req.body);

    await req.audit({
      action: "UPDATE_WALLET",
      entityType: "Wallet",
      entityId: req.params.id,
      before: { name: before.name, balance: Number(before.balance), isDefault: before.isDefault },
      after: { name: wallet.name, balance: Number(wallet.balance), isDefault: wallet.isDefault },
    });

    return success(res, "Wallet berhasil diperbarui", wallet);
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 :
                 error.message.includes("sudah ada") ? 409 : 400;
    return fail(res, error.message, code);
  }
}

export async function deleteWalletRest(req, res) {
  try {
    const before = await WalletService.getWalletDetail(req.user.id, req.params.id);
    await WalletService.deleteWalletRest(req.user.id, req.params.id);

    await req.audit({
      action: "DELETE_WALLET",
      entityType: "Wallet",
      entityId: req.params.id,
      before: { name: before.name, archived: before.archived },
      metadata: { reason: "user_request" },
    });

    return success(res, "Wallet berhasil dihapus");
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 :
                 error.message.includes("transaksi") ? 400 :
                 error.message.includes("terakhir") ? 400 : 403;
    return fail(res, error.message, code);
  }
}

export async function transferWalletRest(req, res) {
  try {
    const { fromWalletId, toWalletId, amount, description, date } = req.body;
    if (!fromWalletId || !toWalletId) return fail(res, "Wallet asal dan tujuan wajib diisi", 400);
    if (!amount || amount <= 0) return fail(res, "Nominal transfer tidak valid", 400);

    const result = await WalletService.transferBetweenWalletsRest(req.user.id, {
      fromWalletId,
      toWalletId,
      amount: Number(amount),
      description,
      date,
    });

    await req.audit({
      action: "TRANSFER",
      entityType: "Wallet",
      entityId: fromWalletId,
      metadata: {
        fromWalletId,
        toWalletId,
        amount: Number(amount),
        fromBalanceAfter: result.from.balance,
        toBalanceAfter: result.to.balance,
        transferGroupId: result.transactions?.[0]?.transferGroupId,
        transactionIds: result.transactions?.map((t) => t.id),
      },
    });

    return success(res, "Transfer berhasil", result);
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 :
                 error.message.includes("tidak cukup") ? 400 : 400;
    return fail(res, error.message, code);
  }
}

export async function archiveWalletRest(req, res) {
  try {
    const before = await WalletService.getWalletDetail(req.user.id, req.params.id);
    const wallet = await WalletService.archiveWalletRest(req.user.id, req.params.id);

    await req.audit({
      action: "ARCHIVE_WALLET",
      entityType: "Wallet",
      entityId: req.params.id,
      before: { archived: before.archived, archivedAt: before.archivedAt },
      after: { archived: wallet.archived, archivedAt: wallet.archivedAt },
    });

    return success(res, "Wallet berhasil diarsipkan", wallet);
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 :
                 error.message.includes("sudah diarsipkan") ? 409 : 400;
    return fail(res, error.message, code);
  }
}

export async function restoreWalletRest(req, res) {
  try {
    const before = await WalletService.getWalletDetail(req.user.id, req.params.id);
    const wallet = await WalletService.restoreWalletRest(req.user.id, req.params.id);

    await req.audit({
      action: "RESTORE_WALLET",
      entityType: "Wallet",
      entityId: req.params.id,
      before: { archived: before.archived, archivedAt: before.archivedAt },
      after: { archived: wallet.archived, archivedAt: wallet.archivedAt },
    });

    return success(res, "Wallet berhasil dipulihkan", wallet);
  } catch (error) {
    const code = error.message === "Wallet tidak ditemukan" ? 404 :
                 error.message === "Unauthorized" ? 403 :
                 error.message.includes("tidak dalam status arsip") ? 409 : 400;
    return fail(res, error.message, code);
  }
}
