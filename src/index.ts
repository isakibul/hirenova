const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
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
  try {
    const envErrors = validateRuntimeEnv();
    if (envErrors.length) {
      throw new Error(`Invalid production environment:\n- ${envErrors.join("\n- ")}`);
    }

    await connectDatabase();
    await connectRedis();
    const timestamp = new Date().toLocaleTimeString();

    server.listen(PORT, () => {
      console.log(`${timestamp} - Server is running on PORT ${PORT}`);
    });
  } catch (e) {
    console.error("Error connecting to the database");
    console.log(e);
  }
};

main();
