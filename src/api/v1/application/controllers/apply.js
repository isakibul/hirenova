const applicationService = require("../../../../lib/application");
const { applicationSchema } = require("../../../../lib/validators/applicationValidator");

const apply = async (req, res, next) => {
  try {
    const { error, value } = applicationSchema.validate(req.body, {
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

    const application = await applicationService.applyToJob({
      jobId: req.params.id,
      applicantId: req.user.id,
      coverLetter: value.coverLetter,
    });

    res.status(201).json({
      code: 201,
      message: "Application submitted successfully",
      data: application,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (e) {
    next(e);
  }
};

module.exports = apply;
