const userService = require("../lib/user");
const { authenticationError } = require("../utils/error");

const checkUserStatus = async (req, res, next) => {
  const userEmail = req.user.email;

  const user = await userService.findUserByEmail(userEmail);

  if (!user) {
    next(authenticationError());
  }

  if (user.status !== "active") {
    return res.status(403).json({
      message: `Your account is ${user.status}`,
    });
  }

  next();
};

module.exports = checkUserStatus;
