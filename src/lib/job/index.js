const { Job } = require("../../model");

const create = async ({
  title,
  description,
  location,
  jobType,
  skillsRequired,
  experienceRequired,
  salary,
}) => {
  const job = await Job({
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
  });

  await job.save();

  return {
    ...job._doc,
    id: job.id,
  };
};

module.exports = {
  create,
};
