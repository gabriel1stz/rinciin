import { logAudit } from "../helpers/audit.helper.js";
import prisma from "../lib/prisma.js";

export function auditMiddleware(req, res, next) {
  req.audit = async ({ action, entityType, entityId, before, after, metadata }) => {
    const userId = req.user?.id;
    if (!userId) return;

    return prisma.$transaction(async (tx) => {
      await logAudit(tx, {
        action,
        userId,
        entityType,
        entityId,
        before,
        after,
        metadata,
      });
    });
  };

  next();
}
