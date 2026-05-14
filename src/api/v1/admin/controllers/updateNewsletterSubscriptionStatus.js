const Joi = require("joi");
const newsletterService = require("../../../../lib/newsletter");

const statusSchema = Joi.object({
  status: Joi.string().valid("subscribed", "unsubscribed").required(),
});

const updateNewsletterSubscriptionStatus = async (req, res, next) => {
  const { error, value } = statusSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const subscription = await newsletterService.updateStatus(
      req.params.id,
      value.status
    );

    res.status(200).json({
      message:
        subscription.status === "unsubscribed"
          ? "Newsletter email unsubscribed."
          : "Newsletter email resubscribed.",
      data: subscription,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateNewsletterSubscriptionStatus;
