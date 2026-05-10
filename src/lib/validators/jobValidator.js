const Joi = require("joi");

const jobSchema = Joi.object({
  title: Joi.string().min(10).max(150).required(),
  description: Joi.string().max(5000).optional(),
  location: Joi.string().max(100).optional(),
  jobType: Joi.string()
    .valid("full-time", "part-time", "remote", "contract")
    .optional(),
  skillsRequired: Joi.array().items(Joi.string()).optional(),
  experienceRequired: Joi.number().min(0).optional(),
  experienceMin: Joi.number().min(0).optional(),
  experienceMax: Joi.number().min(0).optional(),
  salary: Joi.number().min(0).optional(),
  status: Joi.string().valid("open", "closed").optional(),
  approvalStatus: Joi.string().valid("pending", "approved", "declined").optional(),
  rejectionNote: Joi.string().max(1000).allow("").optional(),
  expiresAt: Joi.date().iso().allow(null).optional(),
});

const jobStatusSchema = Joi.object({
  status: Joi.string().valid("open", "closed").required(),
  expiresAt: Joi.date().iso().allow(null).optional(),
});

const jobApprovalSchema = Joi.object({
  approvalStatus: Joi.string().valid("approved", "declined").required(),
  rejectionNote: Joi.when("approvalStatus", {
    is: "declined",
    then: Joi.string().trim().max(1000).required(),
    otherwise: Joi.string().trim().max(1000).allow("").optional(),
  }),
});

module.exports = { jobSchema, jobStatusSchema, jobApprovalSchema };
