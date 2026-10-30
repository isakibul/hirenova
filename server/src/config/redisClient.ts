const { createClient } = require("redis");
const logger = require("../infrastructure/observability/logger");

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

const client = createClient({ url: redisUrl });

client.on("error", (e) => {
  logger.error("Redis connection error", { component: "redis", error: e.message });
});

const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    const endpoint = new URL(redisUrl);
    logger.info("Redis connected", {
      component: "redis",
      host: endpoint.hostname,
      port: Number(endpoint.port || 6379),
    });
  }
};

const disconnectRedis = async () => {
  if (client.isOpen) {
    await client.quit();
    logger.info("Redis disconnected", { component: "redis" });
  }
};

module.exports = { client, connectRedis, disconnectRedis };
