const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
const logger = require("./infrastructure/observability/logger");
const app = require("./app");
const { connectDatabase } = require("./db");
const { connectRedis } = require("./config/redisClient");
const { validateRuntimeEnv } = require("./config/env");
const { initRealtime } = require("./realtime/socket");

/**
 * Create HTTP server
 */
const server = http.createServer(app);
initRealtime(server);

/**
 * Server configuration
 */
const PORT = process.env.PORT || 4000;

/**
 * Main function
 * Connects to MongoDB and starts the HTTP server
 */
const main = async () => {
  const startedAt = Date.now();
  try {
    const envErrors = validateRuntimeEnv();
    if (envErrors.length) {
      throw new Error(`Invalid production environment:\n- ${envErrors.join("\n- ")}`);
    }

    await connectDatabase();
    await connectRedis();

    server.listen(PORT, () => {
      logger.info("Server ready", {
        component: "server",
        api: `http://localhost:${PORT}/api/v1`,
        startup: `${Date.now() - startedAt}ms`,
      });
    });
  } catch (e) {
    logger.error("Application startup failed", { error: e.message, stack: e.stack });
    process.exit(1);
  }
};

main();
