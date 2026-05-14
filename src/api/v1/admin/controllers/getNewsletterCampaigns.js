const newsletterService = require("../../../../lib/newsletter");

const getNewsletterCampaigns = async (_req, res, next) => {
  try {
    const campaigns = await newsletterService.findCampaigns({ limit: 8 });

    res.status(200).json({
      data: campaigns,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getNewsletterCampaigns;
