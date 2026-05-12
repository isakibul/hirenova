const addUser = require("./addUser");
const getAllUser = require("./getAllUser");
const getSingleUser = require("./getSingleUser");
const removeUser = require("./removeUser");
const makeAdmin = require("./makeAdmin");
const updateUser = require("./updateUser");
const getNewsletterSubscriptions = require("./getNewsletterSubscriptions");
const removeNewsletterSubscription = require("./removeNewsletterSubscription");

module.exports = {
  addUser,
  getAllUser,
  getSingleUser,
  removeUser,
  makeAdmin,
  updateUser,
  getNewsletterSubscriptions,
  removeNewsletterSubscription,
};
