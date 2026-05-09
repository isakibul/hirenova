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
  expiresAt: Joi.date().iso().allow(null).optional(),
});

const jobStatusSchema = Joi.object({
  status: Joi.string().valid("open", "closed").required(),
  expiresAt: Joi.date().iso().allow(null).optional(),
});

module.exports = { jobSchema, jobStatusSchema };
