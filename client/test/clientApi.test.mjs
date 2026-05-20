import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import axios from "axios";

const clientApi = await import("../app/_lib/clientApi.js");

afterEach(() => {
  delete globalThis.window;
  delete process.env.NEXT_PUBLIC_BACKEND_API_URL;
  delete process.env.NEXT_PUBLIC_DIRECT_BACKEND_API;
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

test("getBackendPath defaults to the same-origin api proxy", () => {
  assert.equal(clientApi.getBackendPath("/auth/session"), "/api/v1/auth/session");
});

test("browser requests prefer same-origin proxy unless direct api is enabled", () => {
  globalThis.window = {};
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";

  assert.equal(clientApi.getBackendPath("/auth/session"), "/api/v1/auth/session");

  process.env.NEXT_PUBLIC_DIRECT_BACKEND_API = "true";

  assert.equal(
    clientApi.getBackendPath("/auth/session"),
    "https://api.example.com/api/v1/auth/session",
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

test("getStoredAccessToken reads browser storage and tolerates invalid state", () => {
  clientApi.setMemoryAccessToken("");
  const storage = new Map([["hirenova-auth", JSON.stringify({ accessToken: "stored-token" })]]);
  globalThis.window = {
    localStorage: {
      getItem(key) {
        return storage.get(key);
      },
    },
  };

  assert.equal(clientApi.getStoredAccessToken(), "stored-token");

  storage.set("hirenova-auth", "{bad-json");
  assert.equal(clientApi.getStoredAccessToken(), "");
});

test("backendFetch adds auth and JSON headers for backend requests", async (t) => {
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";
  const requestMock = t.mock.method(axios, "request", async (config) => {
    if (config.url === "https://api.example.com/api/v1/auth/csrf") {
      return {
        data: { data: { csrfToken: "csrf-123" } },
        headers: {},
        status: 200,
        statusText: "OK",
      };
    }

    return {
      data: {
        url: config.url,
        authorization: config.headers.Authorization,
        contentType: config.headers["Content-Type"],
        withCredentials: config.withCredentials,
        csrfToken: config.headers["X-CSRF-Token"],
        method: config.method,
      },
      headers: {},
      status: 200,
      statusText: "OK",
    };
  });

  const response = await clientApi.backendFetch("/jobs", {
    method: "POST",
    accessToken: "token-123",
    body: JSON.stringify({ title: "Senior Engineer" }),
  });
  const body = await response.json();

  assert.equal(requestMock.mock.callCount(), 2);
  assert.deepEqual(body, {
    url: "https://api.example.com/api/v1/jobs",
    authorization: "Bearer token-123",
    contentType: "application/json",
    withCredentials: true,
    csrfToken: "csrf-123",
    method: "POST",
  });
});

test("requestJson throws API messages for non-2xx responses", async (t) => {
  t.mock.method(axios, "request", async () => ({
    data: { errors: ["First issue.", "Second issue."] },
    headers: {},
    status: 400,
    statusText: "Bad Request",
  }));

  await assert.rejects(
    () => clientApi.requestJson("https://example.com/fail", {}),
    /First issue\. Second issue\./,
  );
});

test("requestBackendJson returns backend bodies and requestJson uses backendFetch for relative paths", async (t) => {
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";
  const requestMock = t.mock.method(axios, "request", async (config) => ({
    data: { ok: true, url: config.url },
    headers: {},
    status: 200,
    statusText: "OK",
  }));

  const backendBody = await clientApi.requestBackendJson("/profile", {});
  const relativeBody = await clientApi.requestJson("/jobs", {});

  assert.equal(requestMock.mock.callCount(), 2);
  assert.deepEqual(backendBody, {
    ok: true,
    url: "https://api.example.com/api/v1/profile",
  });
  assert.deepEqual(relativeBody, {
    ok: true,
    url: "https://api.example.com/api/v1/jobs",
  });
});

test("backendFetch can skip csrf for unsafe requests", async (t) => {
  process.env.NEXT_PUBLIC_BACKEND_API_URL = "https://api.example.com/api/v1";
  const requestMock = t.mock.method(axios, "request", async (config) => ({
    data: {
      url: config.url,
      csrfToken: config.headers["X-CSRF-Token"],
      contentType: config.headers["Content-Type"],
    },
    headers: {},
    status: 200,
    statusText: "OK",
  }));

  const response = await clientApi.backendFetch("/logout", {
    method: "POST",
    csrf: false,
    body: new FormData(),
  });
  const body = await response.json();

  assert.equal(requestMock.mock.callCount(), 1);
  assert.equal(body.csrfToken, undefined);
  assert.equal(body.contentType, undefined);
});
