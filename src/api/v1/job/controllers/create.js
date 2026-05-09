const jobService = require("../../../../lib/job");
const { jobSchema } = require("../../../../lib/validators/jobValidator");

const create = async (req, res, next) => {
  try {
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

    const employerId = req.user.id;

    const job = await jobService.create({
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
      author: employerId,
    });

    const response = {
      code: 201,
      message: "Job created successfully",
      data: { ...job },
      links: {
        self: `/api/jobs/${job._id}`,
      },
    };

    res.status(201).json(response);
  } catch (e) {
    next(e);
  }
};

module.exports = create;
