const Joi = require("joi");
const { updateProfile: updateUserProfile } = require("../../../../lib/user");

const profileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  skills: Joi.array().items(Joi.string().max(80)).optional(),
  resumeUrl: Joi.string().uri().max(500).allow("").optional(),
  experience: Joi.number().min(0).optional(),
  preferredLocation: Joi.string().max(100).allow("").optional(),
  companyName: Joi.string().max(120).allow("").optional(),
  companyWebsite: Joi.string().uri().max(500).allow("").optional(),
  companySize: Joi.string().max(50).allow("").optional(),
});

function sanitizeUser(user) {
  const { _id, password, __v, ...rest } = user;

  return {
    id: (_id ?? user.id).toString(),
    ...rest,
  };
}

const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = profileSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const user = await updateUserProfile(req.user.id, {
      username: value.username,
      email: value.email.toLowerCase(),
      skills: value.skills,
      resumeUrl: value.resumeUrl,
      experience: value.experience,
      preferredLocation: value.preferredLocation,
      companyName: value.companyName,
      companyWebsite: value.companyWebsite,
      companySize: value.companySize,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: sanitizeUser(user),
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateProfile;
