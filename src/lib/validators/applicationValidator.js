const Joi = require("joi");

const applicationSchema = Joi.object({
  coverLetter: Joi.string().max(3000).allow("").optional(),
});

const applicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("submitted", "reviewing", "shortlisted", "rejected", "hired")
    .required(),
});

module.exports = { applicationSchema, applicationStatusSchema };
