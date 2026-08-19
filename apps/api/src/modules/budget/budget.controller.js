import { success, fail } from "../../utils/response.js";
import * as BudgetService from "./budget.service.js";

export async function listBudgetsRest(req, res) {
  try {
    const budgets = await BudgetService.listBudgets(req.user.id);
    return success(res, "Daftar budget", budgets);
  } catch (error) {
    return fail(res, error.message, 500);
  }
}

export async function getBudgetRest(req, res) {
  try {
    const budget = await BudgetService.getBudgetById(req.user.id, req.params.id);
    return success(res, "Detail budget", budget);
  } catch (error) {
    const code = error.message === "Budget tidak ditemukan" ? 404 : 401;
    return fail(res, error.message, code);
  }
}

export async function createBudgetRest(req, res) {
  try {
    const { categoryName, name, amount, period, startDate, endDate, walletId, carryOver, notification } = req.body;

    if (!categoryName) return fail(res, "categoryName wajib diisi", 400);

    const budget = await BudgetService.createBudgetRest(req.user.id, {
      categoryName,
      name,
      amount,
      period,
      startDate,
      endDate,
      walletId,
      carryOver,
      notification,
    }, req.audit);

    return success(res, "Budget berhasil dibuat", budget, 201);
  } catch (error) {
    const code = error.message === "Budget untuk kategori ini sudah ada" ? 409 : 400;
    return fail(res, error.message, code);
  }
}

export async function updateBudgetRest(req, res) {
  try {
    const budget = await BudgetService.updateBudgetRest(req.user.id, req.params.id, req.body, req.audit);
    return success(res, "Budget berhasil diperbarui", budget);
  } catch (error) {
    const code = error.message === "Budget tidak ditemukan" ? 404 : 400;
    return fail(res, error.message, code);
  }
}

export async function deleteBudgetRest(req, res) {
  try {
    const budget = await BudgetService.deleteBudgetRest(req.user.id, req.params.id, req.audit);
    return success(res, "Budget berhasil dihapus", budget);
  } catch (error) {
    const code = error.message === "Budget tidak ditemukan" ? 404 : 400;
    return fail(res, error.message, code);
  }
}

export async function restoreBudgetRest(req, res) {
  try {
    const budget = await BudgetService.restoreBudgetRest(req.user.id, req.params.id, req.audit);
    return success(res, "Budget berhasil dipulihkan", budget);
  } catch (error) {
    const code = error.message === "Budget tidak ditemukan" ? 404 :
                 error.message === "Budget tidak dalam status terhapus" ? 409 : 400;
    return fail(res, error.message, code);
  }
}
