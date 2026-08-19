import prisma from "../../lib/prisma.js";
import { metricsCollector } from "../../lib/metrics.collector.js";
import { sendWhatsAppNotification } from "../../helpers/whatsapp.helper.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const userSelect = {
  id: true, phone: true, name: true, email: true, avatar: true,
  tier: true, currency: true, createdAt: true, updatedAt: true,
  subscription: {
    where: { status: "active" },
    orderBy: { expiresAt: "desc" },
    take: 1,
    select: { id: true, plan: true, status: true, startsAt: true, expiresAt: true, amount: true },
  },
};

export async function listUsers({ search, tier, page = 1, limit = 20 }) {
  const where = {};
  if (tier) where.tier = tier;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: userSelect });
}

export async function createUser(data) {
  return prisma.user.create({ data, select: userSelect });
}

export async function updateUser(id, data) {
  const { name, email, avatar, tier, durationDays, isLifetime } = data;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (tier !== undefined) updateData.tier = tier;

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Handle subscription creation/extension if tier is specified
  if (tier && tier.toLowerCase() !== "free") {
    let expiresAt;
    if (isLifetime) {
      expiresAt = new Date("2099-12-31T23:59:59Z");
    } else {
      const days = Number(durationDays) || 30;
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    // Expire old active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: id, status: "active" },
      data: { status: "expired" },
    });

    // Create new active subscription
    await prisma.subscription.create({
      data: {
        userId: id,
        plan: tier.toLowerCase(),
        status: "active",
        amount: 0,
        startsAt: new Date(),
        expiresAt,
        paymentMethod: "admin_manual_grant",
      },
    });
  } else if (tier && tier.toLowerCase() === "free") {
    // Expire active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: id, status: "active" },
      data: { status: "expired", expiresAt: new Date() },
    });
  }

  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}


export async function deleteUser(id) {
  return prisma.$transaction(async (tx) => {
    // 1. Unlink payments so payment audit history is preserved
    await tx.payment.updateMany({ where: { userId: id }, data: { userId: null } });
    // 2. Delete all related user records
    await tx.aiConversation.deleteMany({ where: { userId: id } });
    await tx.goal.deleteMany({ where: { userId: id } });
    await tx.upload.deleteMany({ where: { userId: id } });
    await tx.refreshToken.deleteMany({ where: { userId: id } });
    await tx.transaction.deleteMany({ where: { userId: id } });
    await tx.budget.deleteMany({ where: { userId: id } });
    await tx.category.deleteMany({ where: { userId: id } });
    await tx.wallet.deleteMany({ where: { userId: id } });
    await tx.subscription.deleteMany({ where: { userId: id } });
    // 3. Delete user
    return tx.user.delete({ where: { id } });
  });
}

/* Products */
export async function listProducts({ search, categoryId, status, page = 1, limit = 20 }) {
  const where = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { category: { select: { id: true, name: true, icon: true } } } }),
    prisma.product.count({ where }),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductById(id) {
  return prisma.product.findUnique({ where: { id }, include: { category: { select: { id: true, name: true, icon: true } } } });
}

export async function createProduct(data) {
  return prisma.product.create({ data, include: { category: { select: { id: true, name: true, icon: true } } } });
}

export async function updateProduct(id, data) {
  return prisma.product.update({ where: { id }, data, include: { category: { select: { id: true, name: true, icon: true } } } });
}

export async function deleteProduct(id) {
  return prisma.product.delete({ where: { id } });
}

/* Tables */
export async function listTables({ status, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.status = status;
  const skip = (page - 1) * limit;
  const [tables, total] = await Promise.all([
    prisma.table.findMany({ where, skip, take: limit, orderBy: { number: "asc" } }),
    prisma.table.count({ where }),
  ]);
  return { tables, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createTable(data) {
  return prisma.table.create({ data });
}

export async function updateTable(id, data) {
  return prisma.table.update({ where: { id }, data });
}

export async function deleteTable(id) {
  return prisma.table.delete({ where: { id } });
}

/* Audit Logs */
export async function listAuditLogs({ userId, action, entityType, page = 1, limit = 20 }) {
  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (entityType) where.entityType = entityType;
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/* Export */
export async function exportUsers({ format }) {
  const users = await prisma.user.findMany({
    select: { id: true, phone: true, name: true, email: true, tier: true, currency: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = "ID,Phone,Name,Email,Tier,Currency,Created\n";
    const rows = users.map((u) =>
      `"${u.id}","${u.phone || ""}","${(u.name || "").replace(/"/g, '""')}","${u.email || ""}","${u.tier || "FREE"}","${u.currency || "IDR"}","${u.createdAt?.toISOString() || ""}"`
    ).join("\n");
    return { raw: header + rows, contentType: "text/csv; charset=utf-8", filename: "rinci-users.csv" };
  }

  return users;
}

export async function exportAuditLogs({ format }) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  if (format === "csv") {
    const header = "ID,Action,EntityType,EntityId,UserId,Created\n";
    const rows = logs.map((l) =>
      `"${l.id}","${l.action}","${l.entityType}","${l.entityId}","${l.userId}","${l.createdAt.toISOString()}"`
    ).join("\n");
    return { raw: header + rows, contentType: "text/csv", filename: "audit-logs.csv" };
  }

  return logs;
}

export async function exportInternalAdmins({ format }) {
  const admins = await prisma.internalUser.findMany({
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const header = "ID,Name,Email,Role,LastLogin,Created\n";
    const rows = admins.map((a) =>
      `"${a.id}","${a.name.replace(/"/g, '""')}","${a.email}","${a.role}","${a.lastLoginAt?.toISOString() || ""}","${a.createdAt.toISOString()}"`
    ).join("\n");
    return { raw: header + rows, contentType: "text/csv", filename: "internal-admins.csv" };
  }

  return admins;
}

export async function exportDbMetadata({ format }) {
  const [userCount, productCount, tableCount, transactionCount, walletCount, budgetCount, auditLogCount, internalUserCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.table.count(),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.wallet.count(),
    prisma.budget.count({ where: { deletedAt: null } }),
    prisma.auditLog.count(),
    prisma.internalUser.count(),
  ]);

  const metadata = {
    tables: {
      users: userCount,
      products: productCount,
      tables: tableCount,
      transactions: transactionCount,
      wallets: walletCount,
      budgets: budgetCount,
      auditLogs: auditLogCount,
      internalUsers: internalUserCount,
    },
    totalRecords: userCount + productCount + tableCount + transactionCount + walletCount + budgetCount + auditLogCount + internalUserCount,
    exportedAt: new Date().toISOString(),
  };

  if (format === "csv") {
    const header = "Table,RecordCount\n";
    const rows = Object.entries(metadata.tables).map(([table, count]) => `"${table}",${count}`).join("\n");
    return { raw: header + rows, contentType: "text/csv", filename: "db-metadata.csv" };
  }

  return metadata;
}

/* Internal Admins */
export async function listInternalAdmins({ search, role, page = 1, limit = 20 }) {
  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  const skip = (page - 1) * limit;
  const [admins, total] = await Promise.all([
    prisma.internalUser.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, avatar: true, lastLoginAt: true, createdAt: true } }),
    prisma.internalUser.count({ where }),
  ]);
  return { admins, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/* Notifications */
const notificationSelect = { id: true, type: true, title: true, message: true, read: true, createdAt: true };

export async function listNotifications({ type, page = 1, limit = 20 }) {
  const where = {};
  if (type) where.type = type;
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.internalNotification.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select: notificationSelect }),
    prisma.internalNotification.count({ where }),
  ]);
  return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getUnreadNotificationCount() {
  return prisma.internalNotification.count({ where: { read: false } });
}

export async function markNotificationRead(id) {
  return prisma.internalNotification.update({ where: { id }, data: { read: true }, select: notificationSelect });
}

export async function markAllNotificationsRead() {
  await prisma.internalNotification.updateMany({ where: { read: false }, data: { read: true } });
}

/* AI Monitor */
export async function listAiConversations({ page = 1, limit = 20 }) {
  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    prisma.aiConversation.findMany({ skip, take: limit, orderBy: { createdAt: "desc" }, include: { User: { select: { id: true, name: true, email: true } } } }),
    prisma.aiConversation.count(),
  ]);
  return { conversations, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/* System health & Deep Monitoring */
export async function getSystemHealth() {
  const [userCount, transactionCount, aiCount, auditCount, errorNotifications, healthMetrics] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count({ where: { deletedAt: null } }),
    prisma.aiConversation.count(),
    prisma.auditLog.count(),
    prisma.internalNotification.count({ where: { read: false, type: { in: ["SYSTEM_ERROR", "DATABASE_ERROR"] } } }),
    metricsCollector.getHealthMetrics(),
  ]);

  return {
    ...healthMetrics,
    records: { users: userCount, transactions: transactionCount, aiConversations: aiCount, auditLogs: auditCount },
    unresolvedErrors: errorNotifications,
    timestamp: new Date().toISOString(),
  };
}

export async function getSecurityMetrics() {
  return await metricsCollector.getSecurityMetrics();
}

export async function getSlaMetrics() {
  return await metricsCollector.getSlaMetrics();
}

export async function getUsageMetrics() {
  return await metricsCollector.getUsageMetrics();
}

export async function getMonitoringSummary() {
  return await metricsCollector.getMonitoringSummary();
}

export async function cleanupExpiredSessions() {
  const now = new Date();
  const deletedTokens = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { revoked: true }
      ]
    }
  });

  metricsCollector.recordSecurityEvent("EXPIRED_SESSIONS_CLEANED", { count: deletedTokens.count });

  return {
    success: true,
    message: `Berhasil membersihkan ${deletedTokens.count} sesi kadaluarsa / tercabut.`,
    cleanedCount: deletedTokens.count,
  };
}

/* Broadcast WhatsApp Messages with Safe Pacing */
export async function sendBroadcastMessage({ message, targetTier = "ALL", delaySeconds = 2 }) {
  if (!message || !message.trim()) {
    throw new Error("Pesan broadcast tidak boleh kosong");
  }

  const normalized = String(targetTier || "ALL").toUpperCase();
  const tierConditions = [];

  if (normalized === "PRO") {
    tierConditions.push(
      { tier: { equals: "pro", mode: "insensitive" } },
      { tier: { equals: "personal", mode: "insensitive" } }
    );
  } else if (normalized === "FAMILY") {
    tierConditions.push(
      { tier: { equals: "family", mode: "insensitive" } },
      { tier: { equals: "premium", mode: "insensitive" } }
    );
  } else if (normalized === "TRIAL") {
    tierConditions.push(
      { tier: { equals: "trial", mode: "insensitive" } }
    );
  } else if (normalized === "FREE") {
    tierConditions.push(
      { tier: { equals: "free", mode: "insensitive" } },
      { tier: null },
      { tier: "" }
    );
  }

  const where = {
    phone: { not: "" }
  };

  if (tierConditions.length > 0) {
    where.OR = tierConditions;
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, phone: true, tier: true }
  });

  if (users.length === 0) {
    return {
      success: true,
      message: `Tidak ada user yang cocok dengan target tier ${targetTier}.`,
      totalTarget: 0,
    };
  }

  const pacingMs = Math.max(1000, Number(delaySeconds || 2) * 1000);

  // Background broadcast worker with safe delay pacing
  (async () => {
    let successCount = 0;
    for (const u of users) {
      if (!u.phone) continue;
      const personalizedMsg = message
        .replace(/\{name\}/g, u.name || "Sobat Rinci")
        .replace(/\{tier\}/g, (u.tier || "FREE").toUpperCase());

      try {
        const sent = await sendWhatsAppNotification(u.phone, personalizedMsg);
        if (sent) successCount++;
      } catch (err) {
        console.warn(`⚠️ [Broadcast] Gagal kirim ke ${u.phone}:`, err.message);
      }

      await delay(pacingMs);
    }

    metricsCollector.recordSecurityEvent("BROADCAST_COMPLETED", {
      targetTier,
      totalUsers: users.length,
      successCount,
    });
  })().catch((err) => console.error("❌ [Broadcast Worker] Error:", err.message));

  return {
    success: true,
    message: `Broadcast sedang dikirim ke ${users.length} user dengan jeda ${delaySeconds}s antar nomor.`,
    totalTarget: users.length,
    targetTier,
  };
}

/* Internal Dashboard */
export async function getInternalDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { refreshTokens: { some: { revoked: false, expiresAt: { gte: new Date() } } } } });
  const premiumUsers = await prisma.user.count({ where: { tier: { not: "free" } } });

  const todayIncome = await prisma.transaction.aggregate({
    where: { date: { gte: today }, type: "INCOME", deletedAt: null },
    _sum: { amount: true },
  });
  const todayExpense = await prisma.transaction.aggregate({
    where: { date: { gte: today }, type: "EXPENSE", deletedAt: null },
    _sum: { amount: true },
  });

  const totalTransactions = await prisma.transaction.count({ where: { deletedAt: null } });
  const totalWallets = await prisma.wallet.count();
  const totalBudgets = await prisma.budget.count({ where: { deletedAt: null } });
  const totalAiConversations = await prisma.aiConversation.count();

  const recentUsers = await prisma.user.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: userSelect });

  return {
    totalUsers,
    activeUsers,
    premiumUsers,
    todayRevenue: todayIncome._sum.amount || 0,
    todayExpense: todayExpense._sum.amount || 0,
    todayNet: (todayIncome._sum.amount || 0) - (todayExpense._sum.amount || 0),
    totalTransactions,
    totalWallets,
    totalBudgets,
    totalAiConversations,
    recentUsers,
  };
}
