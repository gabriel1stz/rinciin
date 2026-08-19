import { Router } from "express";
import { requireInternalAuth } from "../../middleware/internal-auth.middleware.js";
import * as ctrl from "./internal.controller.js";

const router = Router();

router.use(requireInternalAuth);

router.get("/dashboard", ctrl.getDashboard);

router.get("/users", ctrl.listUsers);
router.get("/users/:id", ctrl.getUser);
router.post("/users", ctrl.createUser);
router.put("/users/:id", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);

router.get("/products", ctrl.listProducts);
router.get("/products/:id", ctrl.getProduct);
router.post("/products", ctrl.createProduct);
router.put("/products/:id", ctrl.updateProduct);
router.delete("/products/:id", ctrl.deleteProduct);

router.get("/tables", ctrl.listTables);
router.post("/tables", ctrl.createTable);
router.put("/tables/:id", ctrl.updateTable);
router.delete("/tables/:id", ctrl.deleteTable);

router.get("/audit-logs", ctrl.listAuditLogs);
router.get("/categories", ctrl.listCategories);

router.get("/admins", ctrl.listInternalAdmins);

router.get("/notifications", ctrl.listNotifications);
router.get("/notifications/unread-count", ctrl.getUnreadCount);
router.put("/notifications/:id/read", ctrl.markNotificationRead);
router.put("/notifications/read-all", ctrl.markAllNotificationsRead);

router.get("/ai-conversations", ctrl.listAiConversations);

router.get("/system-health", ctrl.getSystemHealth);
router.get("/health-metrics", ctrl.getSystemHealth);
router.get("/security-metrics", ctrl.getSecurityMetrics);
router.get("/sla-metrics", ctrl.getSlaMetrics);
router.get("/usage-metrics", ctrl.getUsageMetrics);
router.get("/monitoring-summary", ctrl.getMonitoringSummary);
router.post("/maintenance/cleanup-sessions", ctrl.cleanupExpiredSessions);
router.post("/broadcast", ctrl.sendBroadcast);

router.get("/export/users", ctrl.exportUsers);
router.get("/export/audit-logs", ctrl.exportAuditLogs);
router.get("/export/internal-admins", ctrl.exportInternalAdmins);
router.get("/export/db-metadata", ctrl.exportDbMetadata);

export default router;
