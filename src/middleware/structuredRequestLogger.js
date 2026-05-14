const logger = require("../lib/observability/logger");

const structuredRequestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]("HTTP request", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      actorRole: req.user?.role || "anonymous",
    });
  });

  next();
};

module.exports = structuredRequestLogger;
