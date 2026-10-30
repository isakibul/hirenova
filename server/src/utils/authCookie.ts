const authCookieName = process.env.AUTH_COOKIE_NAME || "hirenova_access";

const getCookieMaxAgeMs = () =>
  Number(process.env.AUTH_COOKIE_MAX_AGE_SECONDS || 8 * 60 * 60) * 1000;

const getCookieOptions = () => {
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
    maxAge: getCookieMaxAgeMs(),
  };
};

const setAuthCookie = (res, token) => {
  res.cookie(authCookieName, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  const { maxAge, ...options } = getCookieOptions();
  res.clearCookie(authCookieName, options);
};

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

      const name = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});

const getAuthCookie = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  return cookies[authCookieName] || "";
};

module.exports = {
  authCookieName,
  clearAuthCookie,
  getAuthCookie,
  getCookieMaxAgeMs,
  getCookieOptions,
  setAuthCookie,
};
