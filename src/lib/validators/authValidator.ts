/**
 * Authentication validation schemas using Joi
 * @module lib/validators/authValidator
 */
import Joi from "joi";

/**
 * Joi validation schema for user registration
 * @type {Joi.ObjectSchema}
 * @property {string} username - Required, alphanumeric, 3-50 characters
 * @property {string} email - Required, valid email format
 * @property {string} password - Required, min 8, max 50, must contain uppercase, lowercase, and number
 * @property {string} role - Required, must be "jobseeker", "employer", or "admin"
 */
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"))
    .message(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .required(),
  role: Joi.string().valid("jobseeker", "employer", "admin").required(),
});

/**
 * Joi validation schema for user login
 * @type {Joi.ObjectSchema}
 * @property {string} email - Required, valid email format
 * @property {string} password - Required
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().required(),
});

export { loginSchema, registerSchema };
