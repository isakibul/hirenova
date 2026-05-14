const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createAuthenticate } = require("../src/middleware/authenticate");

function createNextSpy() {
  const calls = [];
  const next = (error) => {
    calls.push(error);
  };

  next.calls = calls;
  return next;
}

test("authenticate stops when the authorization header is missing", async () => {
  const authenticate = createAuthenticate({
    tokenService: {
      verifyToken() {
        throw new Error("verifyToken should not be called");
      },
    },
    userService: {},
    isTokenBlacklisted() {
      throw new Error("isTokenBlacklisted should not be called");
    },
  });
  const req = { headers: {} };
  const next = createNextSpy();

  await authenticate(req, {}, next);

  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0].status, 401);
  assert.equal(req.user, undefined);
});

test("authenticate stops after a valid token resolves to no user", async () => {
  const authenticate = createAuthenticate({
    tokenService: {
      verifyToken() {
        return { id: "missing-user" };
      },
    },
    userService: {
      async findUserById() {
        return null;
      },
    },
    async isTokenBlacklisted() {
      return false;
    },
  });
  const req = { headers: { authorization: "Bearer valid-token" } };
  const next = createNextSpy();

  await authenticate(req, {}, next);

  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0].status, 401);
  assert.equal(req.user, undefined);
});

test("authenticate attaches user context once for a valid token", async () => {
  let touchCount = 0;
  const authenticate = createAuthenticate({
    tokenService: {
      verifyToken() {
        return { id: "user-1" };
      },
    },
    userService: {
      async findUserById() {
        return {
          _doc: { email: "person@example.com", role: "jobseeker" },
          id: "user-1",
          lastSeenAt: new Date(0),
        };
      },
      async touchLastSeen() {
        touchCount += 1;
      },
    },
    async isTokenBlacklisted() {
      return false;
    },
  });
  const req = { headers: { authorization: "Bearer valid-token" } };
  const next = createNextSpy();

  await authenticate(req, {}, next);

  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0], undefined);
  assert.deepEqual(req.user, {
    email: "person@example.com",
    role: "jobseeker",
    id: "user-1",
  });
  assert.equal(req.token, "valid-token");
  assert.equal(touchCount, 1);
});
