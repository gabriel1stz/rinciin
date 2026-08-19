import { metricsCollector } from "../lib/metrics.collector.js";

export function logger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    metricsCollector.recordRequest(req, res, duration);
    console.log(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}