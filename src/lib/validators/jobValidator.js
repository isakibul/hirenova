const Joi = require("joi");
const apiContract = require("../../../shared/apiContract.json");
const sanitizeText = require("../../utils/sanitizeText");

const sanitizedString = (max) =>
  Joi.string()
    .max(max)
    .custom((value) => sanitizeText(value), "sanitize unsafe markup");

const jobSchema = Joi.object({
  title: Joi.string().min(10).max(150).required(),
  description: sanitizedString(5000).optional(),
  location: sanitizedString(100).optional(),
  jobType: Joi.string()
    .valid(...apiContract.jobs.types)
    .optional(),
  skillsRequired: Joi.array().items(sanitizedString(80)).optional(),
  experienceRequired: Joi.number().min(0).optional(),
  experienceMin: Joi.number().min(0).optional(),
  experienceMax: Joi.number().min(0).optional(),
  salary: Joi.number().min(0).optional(),
  status: Joi.string().valid(...apiContract.jobs.statuses).optional(),
  approvalStatus: Joi.string()
    .valid(...apiContract.jobs.approvalStatuses)
    .optional(),
  rejectionNote: sanitizedString(1000).allow("").optional(),
  expiresAt: Joi.date().iso().allow(null).optional(),
});

const jobStatusSchema = Joi.object({
  status: Joi.string().valid(...apiContract.jobs.statuses).required(),
  expiresAt: Joi.date().iso().allow(null).optional(),
});

const jobApprovalSchema = Joi.object({
  approvalStatus: Joi.string()
    .valid(...apiContract.jobs.reviewableApprovalStatuses)
    .required(),
  rejectionNote: Joi.when("approvalStatus", {
    is: "declined",
    then: sanitizedString(1000).required(),
    otherwise: sanitizedString(1000).allow("").optional(),
  }),
});

module.exports = { jobSchema, jobStatusSchema, jobApprovalSchema };
