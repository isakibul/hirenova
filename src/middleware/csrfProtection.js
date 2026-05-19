const { authenticationError } = require("../utils/error");
const { getAuthCookie } = require("../utils/authCookie");
const { csrfCookieName, verifyCsrfToken } = require("../utils/csrf");

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      cookies[part.slice(0, separatorIndex)] = decodeURIComponent(
        part.slice(separatorIndex + 1),
      );
      return cookies;
    }, {});

const isCsrfExempt = (req) =>
  req.method === "GET" && req.path === "/api/v1/auth/csrf";

const csrfProtection = (req, _res, next) => {
  if (!unsafeMethods.has(req.method) || isCsrfExempt(req) || !getAuthCookie(req)) {
    return next();
  }

  const cookies = parseCookieHeader(req.headers.cookie || "");
  const cookieToken = cookies[csrfCookieName] || "";
  const headerToken = req.get("x-csrf-token") || "";

  if (
    !cookieToken ||
    !headerToken ||
    !verifyCsrfToken(cookieToken) ||
    !safeHeaderMatchesCookie(headerToken, cookieToken)
  ) {
    return next(authenticationError("Invalid CSRF token"));
  }

  return next();
};

function safeHeaderMatchesCookie(headerToken, cookieToken) {
  return headerToken === cookieToken;
}

module.exports = csrfProtection;
