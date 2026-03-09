import { createClient } from "redis";

const redisUrl = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const client = createClient({ url: redisUrl });

client.on("error", (e: Error) => {
  console.error("Redis Client Error:", e);
});

/**
 * Connects to Redis server if not already connected
 * @async
 * @returns {Promise<void>} Resolves when connected to Redis
 * @throws {Error} If connection fails
 */
const connectRedis = async (): Promise<void> => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Successfully connected to Redis");
  }
};

/**
 * Disconnects from Redis server if connected
 * @async
 * @returns {Promise<void>} Resolves when disconnected from Redis
 */
const disconnectRedis = async (): Promise<void> => {
  if (client.isOpen) {
    await client.quit();
    console.log("Disconnected from Redis");
  }
};

export { client, connectRedis, disconnectRedis };
