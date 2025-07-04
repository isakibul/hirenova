const Joi = require("joi");

const jobSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  location: Joi.string().required(),
  jobType: Joi.string().valid("Full-time", "Part-time", "Contract").required(),
  skillsRequired: Joi.array().items(Joi.string()).required(),
  experienceRequired: Joi.string().required(),
  salary: Joi.string().required(),
});

module.exports = {
  jobSchema,
};
