const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  getAllowedOrigins,
  parseCsv,
  validateRuntimeEnv,
} = require("../src/config/env");

test("parseCsv trims empty values", () => {
  assert.deepEqual(parseCsv(" https://app.example.com, ,http://localhost:3000 "), [
    "https://app.example.com",
    "http://localhost:3000",
  ]);
});

test("getAllowedOrigins falls back only outside production", () => {
  assert.deepEqual(getAllowedOrigins({ NODE_ENV: "development" }), [
    "http://localhost:3000",
  ]);
  assert.deepEqual(getAllowedOrigins({ NODE_ENV: "production" }), []);
});

test("validateRuntimeEnv requires production hardening values", () => {
  const errors = validateRuntimeEnv({
    NODE_ENV: "production",
    DATABASE_CONNECTION_URL: "mongodb://localhost:27017",
    DB_NAME: "hirenova",
    CLIENT_URL: "https://app.example.com",
    CORS_ORIGINS: "https://app.example.com",
    ACCESS_TOKEN_SECRET: "replace-with-a-strong-access-token-secret",
    EMAIL_SECRET: "real-email-secret",
    OBSERVABILITY_HASH_SECRET: "real-observability-secret",
    EMAIL_HOST: "smtp.example.com",
    EMAIL_PORT: "587",
    EMAIL_FROM: "HireNova <no-reply@example.com>",
    RATE_LIMIT_STORE: "memory",
    REDIS_URL: "redis://localhost:6379",
  });

  assert.ok(errors.includes("RATE_LIMIT_STORE must be redis in production."));
  assert.ok(
    errors.includes(
      "ACCESS_TOKEN_SECRET must be set to a strong non-placeholder secret.",
    ),
  );
});
