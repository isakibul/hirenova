/**
 * Express application setup
 * @module app
 */
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

import v1Routes from "./routes/v1";

/**
 * Express application instance
 * @type {express.Application}
 */
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
  }),
);
app.use(hpp());
app.disable("x-powered-by");

/**
 * Preventing DoS attacks via payload size
 */
app.use(express.json({ limit: "10kb" }));

/**
 * Health checker route
 */
app.get("/health", (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ status: "OK", uptime: process.uptime() });
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
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Route not found" });
});

/**
 * Global error handler
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default app;
