const savedJobService = require("../../../../lib/savedJob");

const save = async (req, res, next) => {
  try {
    const savedJob = await savedJobService.saveJob({
      jobId: req.params.id,
      userId: req.user.id,
    });

    res.status(201).json({
      code: 201,
      message: "Job saved successfully",
      data: savedJob,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = save;
