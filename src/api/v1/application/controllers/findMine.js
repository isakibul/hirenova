const applicationService = require("../../../../lib/application");

const findMine = async (req, res, next) => {
  try {
    const applications = await applicationService.findMine({
      applicantId: req.user.id,
    });

    res.status(200).json({
      data: applications,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findMine;
