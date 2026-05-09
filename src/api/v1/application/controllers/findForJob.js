const applicationService = require("../../../../lib/application");

const findForJob = async (req, res, next) => {
  try {
    const applications = await applicationService.findForJob({
      jobId: req.params.id,
      user: req.user,
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

module.exports = findForJob;
