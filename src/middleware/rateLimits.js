const rateLimit = require("express-rate-limit");

const buildRedisStore = (windowMs) => {
  if (process.env.RATE_LIMIT_STORE !== "redis") {
    return undefined;
  }

  const { client } = require("../config/redisClient");

  return {
    async increment(key) {
      if (!client.isOpen) {
        return { totalHits: 1, resetTime: new Date(Date.now() + windowMs) };
      }

      const redisKey = `rate-limit:${key}`;
      const totalHits = await client.incr(redisKey);

      if (totalHits === 1) {
        await client.pExpire(redisKey, windowMs);
      }

      const ttl = await client.pTTL(redisKey);
      return {
        totalHits,
        resetTime: new Date(Date.now() + Math.max(ttl, 0)),
      };
    },
    async decrement(key) {
      if (client.isOpen) {
        await client.decr(`rate-limit:${key}`);
      }
    },
    async resetKey(key) {
      if (client.isOpen) {
        await client.del(`rate-limit:${key}`);
      }
    },
  };
};

const createLimiter = ({ windowMinutes, max, message }) => {
  const windowMs = windowMinutes * 60 * 1000;

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    store: buildRedisStore(windowMs),
  });
};

module.exports = {
  assistantLimiter: createLimiter({
    windowMinutes: 5,
    max: 20,
    message: "Too many assistant requests. Please try again shortly.",
  }),
  authLimiter: createLimiter({
    windowMinutes: 15,
    max: 20,
    message: "Too many authentication attempts. Please try again later.",
  }),
  passwordLimiter: createLimiter({
    windowMinutes: 15,
    max: 8,
    message: "Too many password requests. Please try again later.",
  }),
  newsletterLimiter: createLimiter({
    windowMinutes: 15,
    max: 15,
    message: "Too many newsletter requests. Please try again later.",
  }),
  writeLimiter: createLimiter({
    windowMinutes: 5,
    max: 60,
    message: "Too many write requests. Please slow down and try again.",
  }),
};
