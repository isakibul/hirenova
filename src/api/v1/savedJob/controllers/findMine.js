const savedJobService = require("../../../../lib/savedJob");

const findMine = async (req, res, next) => {
  try {
    const savedJobs = await savedJobService.findMine({
      userId: req.user.id,
    });

    res.status(200).json({
      data: savedJobs,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findMine;
