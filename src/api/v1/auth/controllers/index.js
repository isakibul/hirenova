const register = require("./register");
const login = require("./login");
const confirmEmail = require("./confirmEmail");
const forgotPassword = require("./forgotPassword");
const resetPassword = require("./resetPassword");
const changePassword = require("./changePassword");

module.exports = {
  login,
  register,
  confirmEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
