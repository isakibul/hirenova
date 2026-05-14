const Joi = require("joi");
const newsletterService = require("../../../../lib/newsletter");

const campaignSchema = Joi.object({
  subject: Joi.string().trim().min(3).max(140).required(),
  previewText: Joi.string().trim().max(180).allow("").optional(),
  body: Joi.string().trim().min(10).max(8000).required(),
});

const sendNewsletterCampaign = async (req, res, next) => {
  const { error, value } = campaignSchema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const campaign = await newsletterService.sendCampaign({
      ...value,
      sentBy: req.user?.id,
    });

    res.status(201).json({
      message: `Newsletter campaign sent to ${campaign.sentCount} recipient${
        campaign.sentCount === 1 ? "" : "s"
      }.`,
      data: campaign,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = sendNewsletterCampaign;
