const register = require("./register");
const login = require("./login");
const confirmEmail = require("./confirmEmail");
const forgotPassword = require("./forgotPassword");
const resetPassword = require("./resetPassword");
const changePassword = require("./changePassword");
const getProfile = require("./getProfile");
const updateProfile = require("./updateProfile");
const logout = require("./logout");
const session = require("./session");
const resendConfirmation = require("./resendConfirmation");
const deactivateAccount = require("./deactivateAccount");
const uploadResume = require("./uploadResume");
const parseResume = require("./parseResume");
const requestEmployerRole = require("./requestEmployerRole");

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
  session,
  resendConfirmation,
  deactivateAccount,
  uploadResume,
  parseResume,
  requestEmployerRole,
};
