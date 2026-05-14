const metrics = {
  startedAt: new Date(),
  totalRequests: 0,
  ignoredRequests: 0,
  totalErrors: 0,
  slowRequests: 0,
  byStatusClass: {},
  byMethod: {},
  lastErrorAt: null,
};

const ignoredPathPatterns = [
  /^\/health$/,
  /^\/api\/v1\/admin\/system-monitor-summary$/,
  /^\/api\/v1\/admin\/audit-logs$/,
  /^\/api\/v1\/admin\/email-events$/,
];

const shouldIgnoreRequest = (req) =>
  req.method === "OPTIONS" ||
  ignoredPathPatterns.some((pattern) => pattern.test(req.path));

const requestMetrics = (req, res, next) => {
  const start = Date.now();

  if (shouldIgnoreRequest(req)) {
    metrics.ignoredRequests += 1;
    return next();
  }

  metrics.totalRequests += 1;
  metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;

  res.on("finish", () => {
    const statusClass = `${Math.floor(res.statusCode / 100)}xx`;
    const durationMs = Date.now() - start;

    metrics.byStatusClass[statusClass] =
      (metrics.byStatusClass[statusClass] || 0) + 1;

    if (res.statusCode >= 500) {
      metrics.totalErrors += 1;
      metrics.lastErrorAt = new Date();
    }

    if (durationMs > 1000) {
      metrics.slowRequests += 1;
      console.warn(
        `Slow request: ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
      );
    }
  });

  next();
};

requestMetrics.getSnapshot = () => ({
  ...metrics,
  uptimeSeconds: Math.round(process.uptime()),
});

module.exports = requestMetrics;
