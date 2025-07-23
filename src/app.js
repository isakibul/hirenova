const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const router = require("./routes/index");

const app = express();
app.use(morgan("dev"));

/**
 * Security middlewares
 */
app.use(helmet());
app.use(cors());
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
app.use(mongoSanitize());
app.use(xss());
app.disable("x-powered-by");

/**
 * Preventing DoS attacks via payload size
 */
app.use(express.json({ limit: "10kb" }));

/**
 * Health checker route
 */
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

/**
 * Routes
 */
app.use(router);

/**
 * 404 - Not found handler
 */
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

/**
 * Global error handler
 */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;
