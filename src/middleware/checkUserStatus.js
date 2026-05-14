const userService = require("../lib/user");
const { authenticationError } = require("../utils/error");

const createCheckUserStatus =
  ({ userService }) =>
  async (req, res, next) => {
    const userEmail = req.user.email;

    const user = await userService.findUserByEmail(userEmail);

    if (!user) {
      return next(authenticationError());
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: `Your account is ${user.status}`,
      });
    }

    return next();
  };

const checkUserStatus = createCheckUserStatus({ userService });

module.exports = checkUserStatus;
module.exports.createCheckUserStatus = createCheckUserStatus;
