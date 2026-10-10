const { authorizationError } = require("../utils/error");

const authorize =
  (roles = ["admin"]) =>
  (req, _res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return next(
      authorizationError("You do not have permission to perform this action")
    );
  };

module.exports = authorize;
