/**
 * Job validation schemas using Joi
 * @module lib/validators/jobValidator
 */
import Joi from "joi";

/**
 * Joi validation schema for job creation/update
 * @type {Joi.ObjectSchema}
 * @property {string} title - Required, 10-150 characters
 * @property {string} description - Optional, max 5000 characters
 * @property {string} location - Optional, max 100 characters
 * @property {string} jobType - Optional, must be "full-time", "part-time", "remote", or "contract"
 * @property {string[]} skillsRequired - Optional, array of strings
 * @property {number} experienceRequired - Optional, minimum 0
 * @property {number} salary - Optional, minimum 0
 */
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

export { jobSchema };
