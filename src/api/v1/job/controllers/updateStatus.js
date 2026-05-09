const jobService = require("../../../../lib/job");
const { jobStatusSchema } = require("../../../../lib/validators/jobValidator");

const updateStatus = async (req, res, next) => {
  try {
    const { error, value } = jobStatusSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        code: 400,
        message: "Validation Error",
        errors: error.details.map((err) => err.message),
      });
    }

    const job = await jobService.updateStatus({
      id: req.params.id,
      status: value.status,
      expiresAt: value.expiresAt,
    });

    res.status(200).json({
      code: 200,
      message: "Job status updated successfully",
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateStatus;
