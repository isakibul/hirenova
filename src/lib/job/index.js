const { Job } = require("../../model");
const { notFound } = require("../../utils/error");

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

const deleteItem = async (id) => {
  const job = await Job.findById(id);

  if (!job) {
    throw notFound();
  }

  return Job.findByIdAndDelete(id);
};

module.exports = {
  create,
  deleteItem,
};
