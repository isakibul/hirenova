const { addTokenToBlacklist } = require("../../../utils/tokenBlacklist");
const { decodeToken } = require("../../../lib/token");
const { clearAuthCookie, getAuthCookie } = require("../../../utils/authCookie");

const getBearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
};

const logout = async (req, res, next) => {
  try {
    const token = req.token || getBearerToken(req) || getAuthCookie(req);
    const decoded = token ? decodeToken({ token }) : null;

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded?.exp ? decoded.exp - currentTime : 0;

    if (expiresIn > 0) {
      await addTokenToBlacklist(token, expiresIn);
    }

    clearAuthCookie(res);
    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    clearAuthCookie(res);
    res.status(200).json({ message: "Logout successful" });
  }
};

module.exports = logout;
