const Joi = require("joi");
const apiContract = require("../../../shared/apiContract.json");

const applicationSchema = Joi.object({
  coverLetter: Joi.string().max(3000).allow("").optional(),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string().valid(...apiContract.applications.statuses).required(),
});

module.exports = { applicationSchema, applicationStatusSchema };
