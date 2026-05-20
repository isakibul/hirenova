const tokenService = require("../../../lib/token");
const userService = require("../../../lib/user");
const { getAuthCookie, setAuthCookie } = require("../../../utils/authCookie");
const { isTokenBlacklisted } = require("../../../utils/tokenBlacklist");

const refreshWindowSeconds = Number(
  process.env.ACCESS_TOKEN_REFRESH_WINDOW_SECONDS || 60 * 60,
);

function sanitizeUser(user) {
  const { _id, password, __v, ...rest } = user._doc ?? user;

  return {
    id: (_id ?? user.id).toString(),
    ...rest,
  };
}

const getBearerToken = (req) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
};

const session = async (req, res) => {
  const candidateTokens = [getBearerToken(req), getAuthCookie(req)].filter(
    Boolean,
  );

  for (const candidateToken of candidateTokens) {
    try {
      if (await isTokenBlacklisted(candidateToken)) {
        continue;
      }

      const decoded = tokenService.verifyToken({ token: candidateToken });
      const user = decoded.id
        ? await userService.findUserById(decoded.id)
        : await userService.findUserByEmail(decoded.email);

      if (!user) {
        continue;
      }

      if (
        decoded.exp &&
        decoded.exp - Math.floor(Date.now() / 1000) <= refreshWindowSeconds
      ) {
        setAuthCookie(
          res,
          tokenService.generateToken({
            payload: {
              id: user.id,
              name: user.username,
              username: user.username,
              email: user.email,
              role: user.role,
            },
          }),
        );
      }

      res.status(200).json({ data: sanitizeUser(user) });
      return;
    } catch {
      // Session checks are intentionally quiet so anonymous page loads do not
      // create noisy 401 responses or server error logs.
    }
  }

  res.status(200).json({ data: null });
};

module.exports = session;
