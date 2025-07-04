const jobService = require("../../../../lib/job");
const { jobSchema } = require("../../../../lib/validators/jobValidator");

const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error, value } = jobSchema.validate(req.body, {
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

    const {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    } = value;

    const { job, statusCode } = await jobService.updateItem(id, {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    });

    const response = {
      code: statusCode,
      message:
        statusCode === 200
          ? "Job updated successfully"
          : "Job created successfully",
      data: job,
      link: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(statusCode).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = updateItem;
