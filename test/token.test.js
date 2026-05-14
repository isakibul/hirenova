const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const tokenService = require("../src/lib/token");
const tokenBlacklist = require("../src/utils/tokenBlacklist");
const { client } = require("../src/config/redisClient");

const originalAccessSecret = process.env.ACCESS_TOKEN_SECRET;
const originalEmailSecret = process.env.EMAIL_SECRET;

before(() => {
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
  process.env.EMAIL_SECRET = "test-email-secret";
});

after(() => {
  process.env.ACCESS_TOKEN_SECRET = originalAccessSecret;
  process.env.EMAIL_SECRET = originalEmailSecret;
});

test("token service signs, decodes, and verifies access tokens", () => {
  const token = tokenService.generateToken({
    payload: { id: "user-1", role: "jobseeker" },
    expiresIn: "1h",
  });

  const decoded = tokenService.decodeToken({ token });
  const verified = tokenService.verifyToken({ token });

  assert.equal(decoded.id, "user-1");
  assert.equal(verified.role, "jobseeker");
});

test("token service signs and verifies email tokens", () => {
  const token = tokenService.generateEmailToken({ email: "person@example.com" });
  const verified = tokenService.verifyEmailToken(token);

  assert.equal(verified.email, "person@example.com");
});

test("token service converts invalid access tokens to server errors", () => {
  assert.throws(
    () => tokenService.verifyToken({ token: "not-a-token" }),
    (error) => error.status === 500,
  );
});

test("token blacklist writes, reads, and removes entries through Redis client", async (t) => {
  const values = new Map();
  const setMock = t.mock.method(client, "set", async (key, value) => {
    values.set(key, value);
  });
  const getMock = t.mock.method(client, "get", async (key) => values.get(key));
  const delMock = t.mock.method(client, "del", async (key) => {
    values.delete(key);
  });

  await tokenBlacklist.addTokenToBlacklist("token-1", 60);
  assert.equal(await tokenBlacklist.isTokenBlacklisted("token-1"), true);

  await tokenBlacklist.removeTokenFromBlacklist("token-1");
  assert.equal(await tokenBlacklist.isTokenBlacklisted("token-1"), false);

  assert.equal(setMock.mock.callCount(), 1);
  assert.equal(getMock.mock.callCount(), 2);
  assert.equal(delMock.mock.callCount(), 1);
});

test("token blacklist fails closed as not blacklisted when Redis read fails", async (t) => {
  t.mock.method(client, "get", async () => {
    throw new Error("Redis offline");
  });
  const consoleError = t.mock.method(console, "error", () => {});

  assert.equal(await tokenBlacklist.isTokenBlacklisted("token-2"), false);
  assert.equal(consoleError.mock.callCount(), 1);
});
