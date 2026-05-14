const tokenService = require("../lib/token");
const userService = require("../lib/user");
const { authenticationError } = require("../utils/error");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const createAuthenticate =
  ({ tokenService, userService, isTokenBlacklisted }) =>
  async (req, _res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(authenticationError());
      }

      const isBlacklisted = await isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw authenticationError(
          "Token has been invalidated. Please log in again.",
        );
      }

      const decoded = tokenService.verifyToken({ token });

      const user = decoded.id
        ? await userService.findUserById(decoded.id)
        : await userService.findUserByEmail(decoded.email);

      if (!user) {
        return next(authenticationError());
      }

      req.user = { ...user._doc, id: user.id };
      req.token = token;
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
