import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import axios from "axios";

const serverApi = await import("../app/_lib/serverApi.js");
const env = await import("../app/_lib/env.js");
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  delete process.env.BACKEND_API_URL;
  delete process.env.BACKEND_API_TIMEOUT_MS;
  delete process.env.NEXT_PUBLIC_BACKEND_API_URL;
  delete process.env.NEXT_PUBLIC_REALTIME_URL;
  process.env.NODE_ENV = originalNodeEnv;
});

test("server api helpers prefer server-only backend urls", () => {
  process.env.BACKEND_API_URL = "https://api.internal.example/api/v1/";
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://public.example/api/v1";

  assert.equal(
    serverApi.getServerBackendPath("/jobs?search=react"),
    "https://api.internal.example/api/v1/jobs?search=react",
  );
  assert.throws(
    () => serverApi.getServerBackendPath("https://other.example/health"),
    /internal API paths/,
  );
  assert.equal(env.getBackendBaseUrl(), "https://api.internal.example");
});

test("server api helpers reject protocol-relative urls", () => {
  assert.throws(
    () => serverApi.getServerBackendPath("//other.example/health"),
    /internal API paths/,
  );
});

test("requestServerBackend falls back when timeout env is invalid", async (t) => {
  process.env.BACKEND_API_URL = "https://api.internal.example/api/v1";
  process.env.BACKEND_API_TIMEOUT_MS = "nope";
  t.mock.method(axios, "request", async (config) => ({
    data: { data: [], timeout: config.timeout },
    headers: {},
    status: 200,
    statusText: "OK",
  }));

  const result = await serverApi.requestServerBackend("/jobs");

  assert.equal(result.body.timeout, 10_000);
});

test("requestServerBackend returns parsed body metadata", async (t) => {
  process.env.BACKEND_API_URL = "https://api.internal.example/api/v1";
  t.mock.method(axios, "request", async (config) => ({
    data: {
      data: [{ id: "job-1" }],
      message: "Loaded",
      url: config.url,
      method: config.method,
    },
    headers: {},
    status: 200,
    statusText: "OK",
  }));

  const result = await serverApi.requestServerBackend("/jobs");

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, [{ id: "job-1" }]);
  assert.equal(result.message, "Loaded");
  assert.equal(result.body.url, "https://api.internal.example/api/v1/jobs");
  assert.equal(result.body.method, "GET");
});

test("environment URL helpers validate production requirements", () => {
  process.env.NODE_ENV = "production";
  delete process.env.BACKEND_API_URL;

  assert.throws(() => env.getBackendApiUrl(), /BACKEND_API_URL/);
});

test("realtime URL helper prefers explicit URL and derives backend origin", () => {
  process.env.NEXT_PUBLIC_REALTIME_URL = "https://realtime.example.com/";
  assert.equal(env.getBrowserRealtimeUrl(), "https://realtime.example.com");

  delete process.env.NEXT_PUBLIC_REALTIME_URL;
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";
  assert.equal(env.getBrowserRealtimeUrl(), "https://api.example.com");

  process.env.NEXT_PUBLIC_BACKEND_API_URL = "not a url";
  assert.equal(env.getBrowserRealtimeUrl(), "http://localhost:4000");
});
