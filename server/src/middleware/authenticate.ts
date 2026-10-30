const tokenService = require("../shared/security/token");
const userService = require("../modules/users/users.service");
const { authenticationError } = require("../utils/error");
const { getAuthCookie, setAuthCookie } = require("../utils/authCookie");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const refreshWindowSeconds = Number(
  process.env.ACCESS_TOKEN_REFRESH_WINDOW_SECONDS || 60 * 60,
);

const getBearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
};

const createAuthenticate =
  ({ tokenService, userService, isTokenBlacklisted }) =>
  async (req, res, next) => {
    try {
      const candidateTokens = [
        getBearerToken(req),
        getAuthCookie(req),
      ].filter(Boolean);

      if (candidateTokens.length === 0) {
        return next(authenticationError());
      }

      let token = "";
      let decoded = null;

      for (const candidateToken of candidateTokens) {
        const isBlacklisted = await isTokenBlacklisted(candidateToken);
        if (isBlacklisted) {
          continue;
        }

        try {
          decoded = tokenService.verifyToken({ token: candidateToken });
          token = candidateToken;
          break;
        } catch {
          // Keep trying other auth sources. A stale in-memory bearer token should
          // not beat a still-valid httpOnly cookie.
        }
      }

      if (!token || !decoded) {
        return next(authenticationError());
      }

      const user = decoded.id
        ? await userService.findUserById(decoded.id)
        : await userService.findUserByEmail(decoded.email);

      if (!user) {
        return next(authenticationError());
      }

      req.user = { ...user._doc, id: user.id };
      req.token = token;
      if (
        decoded.exp &&
        decoded.exp - Math.floor(Date.now() / 1000) <= refreshWindowSeconds
      ) {
        const refreshedToken = tokenService.generateToken({
          payload: {
            id: user.id,
            name: user.username,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        });
        setAuthCookie(res, refreshedToken);
        req.token = refreshedToken;
      }
      if (
        !user.lastSeenAt ||
        Date.now() - new Date(user.lastSeenAt).getTime() > 60 * 1000
      ) {
        userService.touchLastSeen(user.id).catch(() => undefined);
      }
      return next();
    } catch (err) {
      return next(authenticationError());
    }
  };

const authenticate = createAuthenticate({
  tokenService,
  userService,
  isTokenBlacklisted,
});

module.exports = authenticate;
module.exports.createAuthenticate = createAuthenticate;
