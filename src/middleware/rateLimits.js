const rateLimit = require("express-rate-limit");

const createLimiter = ({ windowMinutes, max, message }) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });

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
