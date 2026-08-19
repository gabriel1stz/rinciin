import prisma from "../../lib/prisma.js";
import { success, fail } from "../../utils/response.js";
import * as internalService from "./internal.service.js";

export async function getDashboard(req, res) {
  try {
    const data = await internalService.getInternalDashboard();
    return success(res, "Internal dashboard", data);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function listUsers(req, res) {
  try {
    const { search, tier, page, limit } = req.query;
    const result = await internalService.listUsers({ search, tier, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Users", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function getUser(req, res) {
  try {
    const user = await internalService.getUserById(req.params.id);
    if (!user) return fail(res, "User not found", 404);
    return success(res, "User", user);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function createUser(req, res) {
  try {
    const { phone, name, email, tier, avatar } = req.body;
    if (!phone) return fail(res, "Phone required", 400);
    const user = await internalService.createUser({ phone, name, email, tier: tier || "free", avatar });
    return success(res, "User created", user, 201);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function updateUser(req, res) {
  try {
    const { name, email, avatar, tier, durationDays, isLifetime } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (avatar !== undefined) data.avatar = avatar;
    if (tier !== undefined) data.tier = tier;
    if (durationDays !== undefined) data.durationDays = durationDays;
    if (isLifetime !== undefined) data.isLifetime = isLifetime;
    const user = await internalService.updateUser(req.params.id, data);
    return success(res, "User updated", user);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}



export async function deleteUser(req, res) {
  try {
    await internalService.deleteUser(req.params.id);
    return success(res, "User deleted");
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

/* Products */
export async function listProducts(req, res) {
  try {
    const { search, categoryId, status, page, limit } = req.query;
    const result = await internalService.listProducts({ search, categoryId, status, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Products", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function getProduct(req, res) {
  try {
    const product = await internalService.getProductById(req.params.id);
    if (!product) return fail(res, "Product not found", 404);
    return success(res, "Product", product);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function createProduct(req, res) {
  try {
    const { name, categoryId, price, image, sku, status, stock } = req.body;
    if (!name || price === undefined) return fail(res, "Name and price required", 400);
    const product = await internalService.createProduct({ name, categoryId, price, image, sku, status: status || "ACTIVE", stock: stock || 0 });
    return success(res, "Product created", product, 201);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function updateProduct(req, res) {
  try {
    const { name, categoryId, price, image, sku, status, stock } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (price !== undefined) data.price = price;
    if (image !== undefined) data.image = image;
    if (sku !== undefined) data.sku = sku;
    if (status !== undefined) data.status = status;
    if (stock !== undefined) data.stock = stock;
    const product = await internalService.updateProduct(req.params.id, data);
    return success(res, "Product updated", product);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function deleteProduct(req, res) {
  try {
    await internalService.deleteProduct(req.params.id);
    return success(res, "Product deleted");
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

/* Tables */
export async function listTables(req, res) {
  try {
    const { status, page, limit } = req.query;
    const result = await internalService.listTables({ status, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Tables", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function createTable(req, res) {
  try {
    const { number, qrCode, status } = req.body;
    if (!number) return fail(res, "Table number required", 400);
    const table = await internalService.createTable({ number: Number(number), qrCode, status: status || "AVAILABLE" });
    return success(res, "Table created", table, 201);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function updateTable(req, res) {
  try {
    const { number, qrCode, status } = req.body;
    const data = {};
    if (number !== undefined) data.number = Number(number);
    if (qrCode !== undefined) data.qrCode = qrCode;
    if (status !== undefined) data.status = status;
    const table = await internalService.updateTable(req.params.id, data);
    return success(res, "Table updated", table);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function deleteTable(req, res) {
  try {
    await internalService.deleteTable(req.params.id);
    return success(res, "Table deleted");
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

/* Audit Logs */
export async function listAuditLogs(req, res) {
  try {
    const { userId, action, entityType, page, limit } = req.query;
    const result = await internalService.listAuditLogs({ userId, action, entityType, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Audit logs", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Export */
export async function exportUsers(req, res) {
  try {
    const format = req.query.format === "csv" ? "csv" : "json";
    const result = await internalService.exportUsers({ format });

    if (format === "csv") {
      res.setHeader("Content-Type", result.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      return res.send(result.raw);
    }

    return success(res, "Users exported", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function exportAuditLogs(req, res) {
  try {
    const format = req.query.format === "csv" ? "csv" : "json";
    const result = await internalService.exportAuditLogs({ format });

    if (format === "csv") {
      res.setHeader("Content-Type", result.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      return res.send(result.raw);
    }

    return success(res, "Audit logs exported", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function exportInternalAdmins(req, res) {
  try {
    const format = req.query.format === "csv" ? "csv" : "json";
    const result = await internalService.exportInternalAdmins({ format });

    if (format === "csv") {
      res.setHeader("Content-Type", result.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      return res.send(result.raw);
    }

    return success(res, "Internal admins exported", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function exportDbMetadata(req, res) {
  try {
    const format = req.query.format === "csv" ? "csv" : "json";
    const result = await internalService.exportDbMetadata({ format });

    if (format === "csv") {
      res.setHeader("Content-Type", result.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      return res.send(result.raw);
    }

    return success(res, "DB metadata exported", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Internal Admins */
export async function listInternalAdmins(req, res) {
  try {
    const { search, role, page, limit } = req.query;
    const result = await internalService.listInternalAdmins({ search, role, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Internal admins", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Notifications */
export async function listNotifications(req, res) {
  try {
    const { type, page, limit } = req.query;
    const result = await internalService.listNotifications({ type, page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "Notifications", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await internalService.getUnreadNotificationCount();
    return success(res, "Unread count", { count });
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function markNotificationRead(req, res) {
  try {
    const notification = await internalService.markNotificationRead(req.params.id);
    return success(res, "Notification marked as read", notification);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

export async function markAllNotificationsRead(_req, res) {
  try {
    await internalService.markAllNotificationsRead();
    return success(res, "All notifications marked as read");
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* AI Monitor */
export async function listAiConversations(req, res) {
  try {
    const { page, limit } = req.query;
    const result = await internalService.listAiConversations({ page: Number(page) || 1, limit: Number(limit) || 20 });
    return success(res, "AI conversations", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* System Health */
export async function getSystemHealth(_req, res) {
  try {
    const health = await internalService.getSystemHealth();
    return success(res, "System health", health);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Security Metrics */
export async function getSecurityMetrics(_req, res) {
  try {
    const security = await internalService.getSecurityMetrics();
    return success(res, "Security metrics", security);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* SLA Metrics */
export async function getSlaMetrics(_req, res) {
  try {
    const sla = await internalService.getSlaMetrics();
    return success(res, "SLA metrics", sla);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Usage Metrics */
export async function getUsageMetrics(_req, res) {
  try {
    const usage = await internalService.getUsageMetrics();
    return success(res, "Usage metrics", usage);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Monitoring Summary */
export async function getMonitoringSummary(_req, res) {
  try {
    const summary = await internalService.getMonitoringSummary();
    return success(res, "Monitoring summary", summary);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* Maintenance - Cleanup Sessions */
export async function cleanupExpiredSessions(_req, res) {
  try {
    const result = await internalService.cleanupExpiredSessions();
    return success(res, result.message, result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* WhatsApp Broadcast */
export async function sendBroadcast(req, res) {
  try {
    const { message, targetTier, delaySeconds } = req.body;
    const result = await internalService.sendBroadcastMessage({ message, targetTier, delaySeconds });
    return success(res, result.message, result);
  } catch (err) {
    return fail(res, err.message, 400);
  }
}

/* Categories */
export async function listCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return success(res, "Categories", categories);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

/* User Session Monitoring */
export async function listActiveSessions(req, res) {
  try {
    const limit = Number(req.query.limit) || 50;
    const sessions = await internalService.listActiveSessions({ limit });
    return success(res, "Sesi aktif berhasil diambil", sessions);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}

export async function revokeUserSession(req, res) {
  try {
    const { id } = req.params;
    const result = await internalService.revokeUserSession(id);
    return success(res, "Sesi pengguna berhasil dicabut / diblokir", result);
  } catch (err) {
    return fail(res, err.message, 500);
  }
}
