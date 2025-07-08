const jobService = require("../../../../lib/job");

const findSingle = async (req, res, next) => {
  const { id } = req.params;
  const expand = req.query.expand || "";

  try {
    const job = await jobService.findSingle({ id, expand });

    res.status(200).json({
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = findSingle;
