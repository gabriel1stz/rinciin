// rate-limit.middleware.js - In-memory High-Performance Rate Limiter
import { metricsCollector } from "../lib/metrics.collector.js";

const requestBuckets = new Map();

// Periodic cleanup of stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestBuckets.entries()) {
    if (now > record.resetTime) {
      requestBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
  message = "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  keyGenerator = (req) => req.ip || req.headers["x-forwarded-for"] || "global",
}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);

    let record = requestBuckets.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      requestBuckets.set(key, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      metricsCollector.recordRateLimitHit(key, req.ip, req.originalUrl);
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: remainingSeconds,
      });
    }

    next();
  };
}

// Pre-configured rate limiters for production
export const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 OTP requests per 10 mins
  message: "Terlalu banyak permintaan OTP. Mohon tunggu 10 menit sebelum mencoba lagi.",
  keyGenerator: (req) => `otp_${req.body?.phone || req.ip}`,
});

export const authLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Terlalu banyak percobaan login. Silakan coba lagi setelah 10 menit.",
  keyGenerator: (req) => `auth_${req.ip}`,
});

export const apiGeneralLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 reqs/minute
  message: "Batas permintaan terlampaui. Silakan perlambat laju permintaan.",
  keyGenerator: (req) => req.ip || "global",
});
