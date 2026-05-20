const rankingService = require("../ranking.service");

const rankForJob = async (req, res, next) => {
  try {
    const applications = await rankingService.rankApplicationsForJob({
      jobId: req.params.id,
      user: req.user,
    });

    res.status(200).json({
      data: applications,
      ranking: {
        mode: "ai-assisted",
        totalItems: applications.length,
      },
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = rankForJob;
