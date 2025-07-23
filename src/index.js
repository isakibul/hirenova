require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectDatabase } = require("./db");
const { connectRedis } = require("./config/redisClient");

/**
 * Create HTTP server
 */
const server = http.createServer(app);

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
