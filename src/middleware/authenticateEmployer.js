const { Employer } = require("../model");
const tokenService = require("../lib/token");
const userService = require("../lib/user");
const { authenticationError } = require("../utils/error");

const authenticateEmployer = async (req, _res, next) => {
  const token = req.headers.authorization.split(" ")[2];

  try {
    const decoded = tokenService.verifyToken({ token });

    const user = await userService.findUserByEmail(Employer, decoded.email);

    if (!user) {
      next(authenticationError());
    }

    req.user = { ...user._doc, id: user.id };
    next();
  } catch (err) {
    next(authenticationError());
  }
};

module.exports = authenticateEmployer;
