const Joi = require("joi");
const userService = require("../../../../lib/user");

const reviewSchema = Joi.object({
  decision: Joi.string().valid("approved", "declined").required(),
});

const reviewRoleChangeRequest = async (req, res, next) => {
  try {
    const { error, value } = reviewSchema.validate(req.body, {
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

    const user = await userService.reviewRoleChangeRequest({
      id: req.params.id,
      reviewerId: req.user.id,
      decision: value.decision,
    });
    const { password, __v, ...data } = user;

    res.status(200).json({
      message:
        value.decision === "approved"
          ? "Employer access approved."
          : "Employer access request declined.",
      data,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = reviewRoleChangeRequest;
