const { badRequest } = require("./error");

const getClientUrl = () => {
  const value =
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");

  if (!value) {
    throw badRequest("CLIENT_URL is required to generate frontend links");
  }

  try {
    const url = new URL(value);
    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    throw badRequest("CLIENT_URL must be a valid frontend URL");
  }
};

const getClientLink = (path) => `${getClientUrl()}${path}`;

module.exports = { getClientLink, getClientUrl };
