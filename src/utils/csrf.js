const crypto = require("crypto");

const csrfCookieName = process.env.CSRF_COOKIE_NAME || "hirenova_csrf";
const csrfTokenTtlSeconds = Number(process.env.CSRF_TOKEN_TTL_SECONDS || 60 * 60);

const getCsrfSecret = () =>
  process.env.CSRF_SECRET ||
  process.env.ACCESS_TOKEN_SECRET ||
  "hirenova-development-csrf-secret";

const getCsrfCookieOptions = () => {
  const sameSite = process.env.AUTH_COOKIE_SAMESITE || "lax";
  const secure =
    process.env.AUTH_COOKIE_SECURE === "true" ||
    process.env.NODE_ENV === "production" ||
    sameSite.toLowerCase() === "none";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: csrfTokenTtlSeconds * 1000,
  };
};

const signCsrfPayload = (payload) =>
  crypto.createHmac("sha256", getCsrfSecret()).update(payload).digest("base64url");

const safeEqual = (left = "", right = "") => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const createCsrfToken = () => {
  const nonce = crypto.randomBytes(32).toString("base64url");
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${nonce}.${issuedAt}`;
  const signature = signCsrfPayload(payload);

  return `${payload}.${signature}`;
};

const verifyCsrfToken = (token = "") => {
  const parts = String(token).split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [nonce, issuedAtRaw, signature] = parts;
  const issuedAt = Number(issuedAtRaw);

  if (!nonce || !Number.isFinite(issuedAt)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (issuedAt > now || now - issuedAt > csrfTokenTtlSeconds) {
    return false;
  }

  return safeEqual(signature, signCsrfPayload(`${nonce}.${issuedAtRaw}`));
};

const setCsrfCookie = (res, token) => {
  res.cookie(csrfCookieName, token, getCsrfCookieOptions());
};

module.exports = {
  createCsrfToken,
  csrfCookieName,
  getCsrfCookieOptions,
  setCsrfCookie,
  verifyCsrfToken,
};
