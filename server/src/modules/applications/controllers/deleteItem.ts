const applicationService = require("../applications.service");

const deleteItem = async (req, res, next) => {
  try {
    const application = await applicationService.deleteApplication({
      applicationId: req.params.id,
      user: req.user,
    });

    res.status(200).json({
      message: "Application deleted successfully",
      data: application,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = deleteItem;
