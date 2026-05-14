const newsletterService = require("../../../../lib/newsletter");

const removeNewsletterCampaign = async (req, res, next) => {
  try {
    const campaign = await newsletterService.removeCampaign(req.params.id);
    res.status(200).json({
      message: "Newsletter campaign history deleted.",
      data: {
        id: campaign.id,
        subject: campaign.subject,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = removeNewsletterCampaign;
