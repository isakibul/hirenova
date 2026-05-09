const Joi = require("joi");
const userService = require("../../../../lib/user");

const adminUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  role: Joi.string().valid("jobseeker", "employer", "admin").optional(),
  status: Joi.string().valid("pending", "active", "suspended").optional(),
  skills: Joi.array().items(Joi.string().max(80)).optional(),
  resumeUrl: Joi.string().uri().max(500).allow("").optional(),
  experience: Joi.number().min(0).optional(),
  preferredLocation: Joi.string().max(100).allow("").optional(),
  companyName: Joi.string().max(120).allow("").optional(),
  companyWebsite: Joi.string().uri().max(500).allow("").optional(),
  companySize: Joi.string().max(50).allow("").optional(),
});

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = adminUserSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const user = await userService.updateUserByAdmin(req.params.id, {
      ...value,
      email: value.email?.toLowerCase(),
    });
    const { password, __v, ...data } = user;

    res.status(200).json({
      message: "User updated successfully",
      data,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateUser;
