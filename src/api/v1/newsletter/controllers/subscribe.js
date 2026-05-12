const Joi = require("joi");
const newsletterService = require("../../../../lib/newsletter");

const newsletterSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .required()
    .messages({
      "string.email": "Enter a valid email address.",
      "any.required": "Email is required.",
    }),
  source: Joi.string().trim().max(80).optional(),
});

const subscribe = async (req, res, next) => {
  const { error, value } = newsletterSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const subscription = await newsletterService.subscribe(value);
    res.status(201).json({
      message: "Thanks for joining the HireNova update list.",
      data: {
        id: subscription.id,
        email: subscription.email,
        status: subscription.status,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = subscribe;
