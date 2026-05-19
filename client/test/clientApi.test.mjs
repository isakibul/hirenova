import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

const clientApi = await import("../app/_lib/clientApi.js");

afterEach(() => {
  delete globalThis.window;
  delete process.env.NEXT_PUBLIC_BACKEND_API_URL;
  clientApi.setMemoryCsrfToken("");
});

test("getBackendPath prefixes relative backend routes", () => {
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1/";

  assert.equal(
    clientApi.getBackendPath("/jobs?search=react"),
    "https://api.example.com/api/v1/jobs?search=react",
  );
  assert.equal(
    clientApi.getBackendPath("auth/profile"),
    "https://api.example.com/api/v1/auth/profile",
  );
});

test("getBackendPath leaves absolute URLs untouched", () => {
  assert.equal(
    clientApi.getBackendPath("https://example.com/health"),
    "https://example.com/health",
  );
});

test("getStoredAccessToken reads valid browser auth state", () => {
  clientApi.setMemoryAccessToken("token-123");

  assert.equal(clientApi.getStoredAccessToken(), "token-123");
});

test("getStoredAccessToken defaults to empty memory state", () => {
  clientApi.setMemoryAccessToken("");

  assert.equal(clientApi.getStoredAccessToken(), "");
});

test("backendFetch adds auth and JSON headers for backend requests", async (t) => {
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, init) => {
    if (url === "https://api.example.com/api/v1/auth/csrf") {
      return Response.json({ data: { csrfToken: "csrf-123" } });
    }

    return Response.json({
      url,
      authorization: init.headers.get("Authorization"),
      contentType: init.headers.get("Content-Type"),
      credentials: init.credentials,
      csrfToken: init.headers.get("X-CSRF-Token"),
      method: init.method,
    });
  });

  const response = await clientApi.backendFetch("/jobs", {
    method: "POST",
    accessToken: "token-123",
    body: JSON.stringify({ title: "Senior Engineer" }),
  });
  const body = await response.json();

  assert.equal(fetchMock.mock.callCount(), 2);
  assert.deepEqual(body, {
    url: "https://api.example.com/api/v1/jobs",
    authorization: "Bearer token-123",
    contentType: "application/json",
    credentials: "include",
    csrfToken: "csrf-123",
    method: "POST",
  });
});

test("requestJson throws API messages for non-2xx responses", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ errors: ["First issue.", "Second issue."] }, { status: 400 }),
  );

  await assert.rejects(
    () => clientApi.requestJson("https://example.com/fail", {}),
    /First issue\. Second issue\./,
  );
});
