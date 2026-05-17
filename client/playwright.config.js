const { defineConfig, devices } = require("@playwright/test");

const rootDir = "..";
const backendPort = Number(process.env.E2E_BACKEND_PORT || 4100);
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 3100);
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${frontendPort}`;
const apiURL =
  process.env.E2E_API_URL || `http://127.0.0.1:${backendPort}/api/v1`;
const databaseName = process.env.E2E_DB_NAME || "hirenova_e2e";
const env = {
  NODE_ENV: "test",
  PORT: String(backendPort),
  DATABASE_CONNECTION_URL:
    process.env.DATABASE_CONNECTION_URL || "mongodb://127.0.0.1:27017",
  DB_NAME: databaseName,
  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  CLIENT_URL: baseURL,
  CORS_ORIGINS: baseURL,
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "hirenova-e2e-access-token-secret",
  EMAIL_SECRET: process.env.EMAIL_SECRET || "hirenova-e2e-email-secret",
  OBSERVABILITY_HASH_SECRET:
    process.env.OBSERVABILITY_HASH_SECRET || "hirenova-e2e-observability-secret",
  EMAIL_HOST: process.env.EMAIL_HOST || "127.0.0.1",
  EMAIL_PORT: process.env.EMAIL_PORT || "1025",
  EMAIL_SECURE: process.env.EMAIL_SECURE || "false",
  EMAIL_FROM: process.env.EMAIL_FROM || "HireNova E2E <noreply@hirenova.test>",
};

module.exports = defineConfig({
  testDir: "./E2E",
  globalSetup: require.resolve("./E2E/global-setup.cjs"),
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm start",
      cwd: rootDir,
      env,
      url: `http://127.0.0.1:${backendPort}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run start:e2e -- --port ${frontendPort}`,
      cwd: ".",
      env: {
        ...env,
        BACKEND_API_URL: apiURL,
        NEXT_PUBLIC_BACKEND_API_URL: apiURL,
      },
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
