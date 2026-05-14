const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { test } = require("node:test");

const authorize = require("../src/middleware/authorize");
const { createCheckUserStatus } = require("../src/middleware/checkUserStatus");
const requestContext = require("../src/middleware/requestContext");
const requestMetrics = require("../src/middleware/requestMetrics");

function createNextSpy() {
  const calls = [];
  const next = (error) => {
    calls.push(error);
  };

  next.calls = calls;
  return next;
}

test("authorize allows configured roles", () => {
  const req = { user: { role: "admin" } };
  const next = createNextSpy();

  authorize(["admin", "superadmin"])(req, {}, next);

  assert.deepEqual(next.calls, [undefined]);
});

test("authorize rejects roles outside the allowed set", () => {
  const req = { user: { role: "jobseeker" } };
  const next = createNextSpy();

  authorize(["admin"])(req, {}, next);

  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0].status, 403);
});

test("checkUserStatus allows active users", async () => {
  const checkUserStatus = createCheckUserStatus({
    userService: {
      async findUserByEmail() {
        return { status: "active" };
      },
    },
  });
  const next = createNextSpy();

  await checkUserStatus({ user: { email: "active@example.com" } }, {}, next);

  assert.deepEqual(next.calls, [undefined]);
});

test("checkUserStatus stops when the user no longer exists", async () => {
  const checkUserStatus = createCheckUserStatus({
    userService: {
      async findUserByEmail() {
        return null;
      },
    },
  });
  const res = {
    status() {
      throw new Error("res.status should not be called");
    },
  };
  const next = createNextSpy();

  await checkUserStatus({ user: { email: "missing@example.com" } }, res, next);

  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0].status, 401);
});

test("checkUserStatus returns 403 for suspended users", async () => {
  const checkUserStatus = createCheckUserStatus({
    userService: {
      async findUserByEmail() {
        return { status: "suspended" };
      },
    },
  });
  const sent = {};
  const res = {
    status(code) {
      sent.status = code;
      return {
        json(body) {
          sent.body = body;
        },
      };
    },
  };
  const next = createNextSpy();

  await checkUserStatus({ user: { email: "blocked@example.com" } }, res, next);

  assert.equal(sent.status, 403);
  assert.deepEqual(sent.body, { message: "Your account is suspended" });
  assert.deepEqual(next.calls, []);
});

test("requestContext reuses incoming correlation IDs", () => {
  const req = { headers: { "x-correlation-id": "trace-123" } };
  const headers = {};
  const res = {
    setHeader(name, value) {
      headers[name] = value;
    },
  };
  const next = createNextSpy();

  requestContext(req, res, next);

  assert.equal(req.id, "trace-123");
  assert.equal(headers["X-Request-Id"], "trace-123");
  assert.deepEqual(next.calls, [undefined]);
});

test("requestMetrics tracks completed non-ignored responses", () => {
  const before = requestMetrics.getSnapshot();
  const req = { method: "GET", path: "/api/v1/jobs", originalUrl: "/api/v1/jobs" };
  const res = new EventEmitter();
  res.statusCode = 200;
  const next = createNextSpy();

  requestMetrics(req, res, next);
  res.emit("finish");

  const after = requestMetrics.getSnapshot();
  assert.equal(after.totalRequests, before.totalRequests + 1);
  assert.ok(after.byMethod.GET >= 1);
  assert.ok(after.byStatusClass["2xx"] >= 1);
  assert.deepEqual(next.calls, [undefined]);
});

test("requestMetrics ignores health checks", () => {
  const before = requestMetrics.getSnapshot();
  const req = { method: "GET", path: "/health", originalUrl: "/health" };
  const res = new EventEmitter();
  const next = createNextSpy();

  requestMetrics(req, res, next);

  const after = requestMetrics.getSnapshot();
  assert.equal(after.ignoredRequests, before.ignoredRequests + 1);
  assert.equal(after.totalRequests, before.totalRequests);
  assert.deepEqual(next.calls, [undefined]);
});
