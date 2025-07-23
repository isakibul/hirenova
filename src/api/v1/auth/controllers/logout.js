const jwt = require("jsonwebtoken");
const { addTokenToBlacklist } = require("../../../../utils/tokenBlacklist");
const { decodeToken } = require("../../../../lib/token");
const { badRequest } = require("../../../../utils/error");

const logout = async (req, res, next) => {
  try {
    const token = req.token;

    const decoded = decodeToken({ token });

    if (!decoded || !decoded.exp) {
      throw badRequest("Invalid token");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - currentTime;

    if (expiresIn > 0) {
      await addTokenToBlacklist(token, expiresIn);
    }

    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    next(e);
    res.status(500).json({ message: "Logout failed" });
  }
};

module.exports = logout;
