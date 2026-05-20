import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const serverApi = await import("../app/_lib/serverApi.js");
const env = await import("../app/_lib/env.js");
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  delete process.env.BACKEND_API_URL;
  delete process.env.NEXT_PUBLIC_BACKEND_API_URL;
  process.env.NODE_ENV = originalNodeEnv;
});

test("server api helpers prefer server-only backend urls", () => {
  process.env.BACKEND_API_URL = "https://api.internal.example/api/v1/";
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://public.example/api/v1";

  assert.equal(
    serverApi.getServerBackendPath("/jobs?search=react"),
    "https://api.internal.example/api/v1/jobs?search=react",
  );
  assert.equal(
    serverApi.getServerBackendPath("https://other.example/health"),
    "https://other.example/health",
  );
  assert.equal(env.getBackendBaseUrl(), "https://api.internal.example");
});

test("requestServerBackend returns parsed body metadata", async (t) => {
  process.env.BACKEND_API_URL = "https://api.internal.example/api/v1";
  t.mock.method(globalThis, "fetch", async (url, init) =>
    Response.json({
      data: [{ id: "job-1" }],
      message: "Loaded",
      url,
      cache: init.cache,
    }),
  );

  const result = await serverApi.requestServerBackend("/jobs");

  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, [{ id: "job-1" }]);
  assert.equal(result.message, "Loaded");
  assert.equal(result.body.url, "https://api.internal.example/api/v1/jobs");
  assert.equal(result.body.cache, "no-store");
});

test("environment URL helpers validate production requirements", () => {
  process.env.NODE_ENV = "production";
  delete process.env.BACKEND_API_URL;

  assert.throws(() => env.getBackendApiUrl(), /BACKEND_API_URL/);
});
