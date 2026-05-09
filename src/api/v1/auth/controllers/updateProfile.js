const Joi = require("joi");
const { updateProfile: updateUserProfile } = require("../../../../lib/user");

const profileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
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
