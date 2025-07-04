const jobService = require("../../../../lib/job");
const { jobSchema } = require("../../../../lib/validators/jobValidator");

const updateItemByPatch = async (req, res, next) => {
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

    const job = await jobService.updateItemUsingPatch(id, {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    });

    const response = {
      code: 200,
      message: "Article updated successfully",
      data: job,
      links: {
        self: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    };

    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = updateItemByPatch;
