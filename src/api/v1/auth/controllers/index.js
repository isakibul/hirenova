const register = require("./register");
const login = require("./login");
const confirmEmail = require("./confirmEmail");
const forgotPassword = require("./forgotPassword");
const resetPassword = require("./resetPassword");
const changePassword = require("./changePassword");
const getProfile = require("./getProfile");
const updateProfile = require("./updateProfile");
const logout = require("./logout");

module.exports = {
  login,
  register,
  confirmEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  logout,
};
