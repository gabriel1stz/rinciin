export async function logAudit(tx, { action, userId, entityType, entityId, before, after, metadata }) {
  const entry = {
    action,
    userId,
    entityType,
    entityId,
    before: before ? JSON.stringify(before) : null,
    after: after ? JSON.stringify(after) : null,
    metadata: metadata ? JSON.stringify(metadata) : null,
  };

  await tx.auditLog.create({ data: entry });
}
