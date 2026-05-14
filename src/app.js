const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const path = require("path");

const v1Routes = require("./routes/v1");
const auditLogger = require("./middleware/auditLogger");
const requestContext = require("./middleware/requestContext");
const requestMetrics = require("./middleware/requestMetrics");
const structuredRequestLogger = require("./middleware/structuredRequestLogger");
const { reportError } = require("./lib/observability/reporter");

const app = express();
app.use(requestContext);
app.use(requestMetrics);

/**
 * Security middlewares
 */
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many request, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(hpp());
app.disable("x-powered-by");
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/**
 * Preventing DoS attacks via payload size
 */
app.use(express.json({ limit: "10kb" }));
app.use(auditLogger);
app.use(structuredRequestLogger);

/**
 * Health checker route
 */
app.get("/health", (_req, res, next) => {
  try {
    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      metrics: requestMetrics.getSnapshot(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Routes
 */
app.use("/api/v1", v1Routes);

/**
 * 404 - Not found handler
 */
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

/**
 * Global error handler
 */
app.use((err, req, res, _next) => {
  void reportError(err, {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    actorRole: req.user?.role || "anonymous",
  });
  const status =
    err.code === "LIMIT_FILE_SIZE" ? 400 : err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error",
    requestId: req.id,
  });
});

module.exports = app;
