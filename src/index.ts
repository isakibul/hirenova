/**
 * Server entry point
 * @module index
 */
import "dotenv/config";
import http from "http";
import app from "./app";
import { connectRedis } from "./config/redisClient";
import { connectDatabase } from "./db";

const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

/**
 * Main function
 * Connects to MongoDB and starts the HTTP server
 */
const main = async (): Promise<void> => {
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
