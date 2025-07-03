const jobService = require("../../../../lib/job");

const create = async (req, res, next) => {
  try {
    const {
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    } = req.body;

    const job = await jobService.create({
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
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
