const addUser = require("./addUser");
const getAllUser = require("./getAllUser");
const getSingleUser = require("./getSingleUser");
const removeUser = require("./removeUser");
const makeAdmin = require("./makeAdmin");
const updateUser = require("./updateUser");
const getNewsletterSubscriptions = require("./getNewsletterSubscriptions");
const getNewsletterCampaigns = require("./getNewsletterCampaigns");
const removeNewsletterCampaign = require("./removeNewsletterCampaign");
const removeNewsletterSubscription = require("./removeNewsletterSubscription");
const sendNewsletterCampaign = require("./sendNewsletterCampaign");
const updateNewsletterSubscriptionStatus = require("./updateNewsletterSubscriptionStatus");
const getAuditLogs = require("./getAuditLogs");
const getEmailEvents = require("./getEmailEvents");
const getSystemMonitorSummary = require("./getSystemMonitorSummary");
const getOperationsSummary = require("./getOperationsSummary");

module.exports = {
  addUser,
  getAllUser,
  getSingleUser,
  removeUser,
  makeAdmin,
  updateUser,
  getNewsletterSubscriptions,
  getNewsletterCampaigns,
  removeNewsletterCampaign,
  removeNewsletterSubscription,
  sendNewsletterCampaign,
  updateNewsletterSubscriptionStatus,
  getAuditLogs,
  getEmailEvents,
  getSystemMonitorSummary,
  getOperationsSummary,
};
