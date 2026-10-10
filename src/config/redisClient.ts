const { createClient } = require("redis");

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const client = createClient({ url: redisUrl });

client.on("error", (e) => {
  console.error("Redis Client Error:", e);
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("Successfully connected to Redis");
  }
};

const disconnectRedis = async () => {
  if (client.isOpen) {
    await client.quit();
    console.log("Disconnected from Redis");
  }
};

module.exports = { client, connectRedis, disconnectRedis };
