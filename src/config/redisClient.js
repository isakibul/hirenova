const { createClient } = require("redis");

const redisUrl = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const client = createClient({ url: redisUrl });

client.on("error", (e) => {
  next(e);
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
