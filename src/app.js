const express = require("express");
const helmet = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const router = require("./routes/index");

const app = express();

/**
 * Security
 */
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

/**
 * Body parser
 */
app.use(express.json());

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
