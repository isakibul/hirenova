const newsletterService = require("../../../../lib/newsletter");

const removeNewsletterSubscription = async (req, res, next) => {
  try {
    const subscription = await newsletterService.remove(req.params.id);
    res.status(200).json({
      message: "Newsletter subscription removed.",
      data: {
        id: subscription.id,
        email: subscription.email,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = removeNewsletterSubscription;
