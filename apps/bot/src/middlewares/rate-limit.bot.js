// rate-limit.bot.js - Per-User Anti-Spam & Anti-Flood Protection for WhatsApp Bot
const userRequestBuckets = new Map();

// Periodic cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [jid, data] of userRequestBuckets.entries()) {
    if (now > data.resetTime) {
      userRequestBuckets.delete(jid);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Check if a WhatsApp user is exceeding rate limits (max 8 messages per 20 seconds)
 */
export function checkBotRateLimit(jid, maxRequests = 8, windowMs = 20 * 1000) {
  const now = Date.now();
  let bucket = userRequestBuckets.get(jid);

  if (!bucket || now > bucket.resetTime) {
    bucket = {
      count: 1,
      resetTime: now + windowMs,
      warned: false,
    };
    userRequestBuckets.set(jid, bucket);
    return { allowed: true };
  }

  bucket.count += 1;

  if (bucket.count > maxRequests) {
    const shouldWarn = !bucket.warned;
    bucket.warned = true;
    const retrySeconds = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000));
    return {
      allowed: false,
      shouldWarn,
      retrySeconds,
    };
  }

  return { allowed: true };
}
