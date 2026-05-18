const Joi = require("joi");
const userService = require("../../../../lib/user");

const roleRequestSchema = Joi.object({
  note: Joi.string().max(300).allow("").optional(),
});

function sanitizeUser(user) {
  const { _id, password, __v, ...rest } = user;

  return {
    id: (_id ?? user.id).toString(),
    ...rest,
  };
}

const requestEmployerRole = async (req, res, next) => {
  try {
    const { error, value } = roleRequestSchema.validate(req.body, {
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

    const user = await userService.requestEmployerRoleChange(
      req.user.id,
      value.note?.trim() ?? "",
    );

    res.status(201).json({
      message: "Employer access request submitted.",
      data: sanitizeUser(user),
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = requestEmployerRole;
