const applicationService = require("../../../../lib/application");
const {
  applicationStatusSchema,
} = require("../../../../lib/validators/applicationValidator");

const updateStatus = async (req, res, next) => {
  try {
    const { error, value } = applicationStatusSchema.validate(req.body, {
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

    const application = await applicationService.updateStatus({
      applicationId: req.params.id,
      status: value.status,
      user: req.user,
    });

    res.status(200).json({
      message: "Application status updated successfully",
      data: application,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = updateStatus;
