const jobService = require("../../../../lib/job");
const { jobApprovalSchema } = require("../../../../lib/validators/jobValidator");

const updateApproval = async (req, res, next) => {
  try {
    const { error, value } = jobApprovalSchema.validate(req.body, {
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

    const job = await jobService.updateApproval({
      id: req.params.id,
      approvalStatus: value.approvalStatus,
      rejectionNote: value.rejectionNote,
      reviewer: req.user,
    });

    res.status(200).json({
      code: 200,
      message:
        value.approvalStatus === "approved"
          ? "Job approved successfully"
          : "Job declined successfully",
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateApproval;
