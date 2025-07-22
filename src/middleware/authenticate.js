const tokenService = require("../lib/token");
const userService = require("../lib/user");
const { authenticationError } = require("../utils/error");

const authenticate = async (req, _res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[2];

    const decoded = tokenService.verifyToken({ token });

    const user = await userService.findUserByEmail(decoded.email);

    if (!user) {
      next(authenticationError());
    }

    req.user = { ...user._doc, id: user.id };
    next();
  } catch (err) {
    next(authenticationError());
  }
};

module.exports = authenticate;
