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
  salary: Joi.number().min(0).optional(),
});

module.exports = { jobSchema };
