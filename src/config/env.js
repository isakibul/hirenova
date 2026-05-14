const LOCAL_CLIENT_URL = "http://localhost:3000";

const parseCsv = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getAllowedOrigins = (env = process.env) => {
  const origins = parseCsv(env.CORS_ORIGINS || env.CLIENT_URL || "");

  if (origins.length) {
    return origins;
  }

  return env.NODE_ENV === "production" ? [] : [LOCAL_CLIENT_URL];
};

const isPlaceholderSecret = (value = "") =>
  !value.trim() || value.startsWith("replace-with-");

const validateRuntimeEnv = (env = process.env) => {
  if (env.NODE_ENV !== "production") {
    return [];
  }

  const errors = [];
  const required = [
    "DATABASE_CONNECTION_URL",
    "DB_NAME",
    "CLIENT_URL",
    "CORS_ORIGINS",
    "ACCESS_TOKEN_SECRET",
    "EMAIL_SECRET",
    "OBSERVABILITY_HASH_SECRET",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_FROM",
  ];

  required.forEach((name) => {
    if (!env[name]?.trim()) {
      errors.push(`${name} is required in production.`);
    }
  });

  ["ACCESS_TOKEN_SECRET", "EMAIL_SECRET", "OBSERVABILITY_HASH_SECRET"].forEach(
    (name) => {
      if (isPlaceholderSecret(env[name])) {
        errors.push(`${name} must be set to a strong non-placeholder secret.`);
      }
    },
  );

  if (env.RATE_LIMIT_STORE !== "redis") {
    errors.push("RATE_LIMIT_STORE must be redis in production.");
  }

  if (!env.REDIS_URL?.trim() && (!env.REDIS_HOST?.trim() || !env.REDIS_PORT?.trim())) {
    errors.push("Set REDIS_URL or both REDIS_HOST and REDIS_PORT in production.");
  }

  if (parseCsv(env.CORS_ORIGINS || "").length === 0) {
    errors.push("CORS_ORIGINS must include at least one production frontend origin.");
  }

  return errors;
};

module.exports = {
  LOCAL_CLIENT_URL,
  getAllowedOrigins,
  parseCsv,
  validateRuntimeEnv,
};
