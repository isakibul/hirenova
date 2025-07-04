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

const updateItem = async (
  id,
  {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
  }
) => {
  const job = await Job.findById(id);

  if (!job) {
    const job = await create({
      title,
      description,
      location,
      jobType,
      skillsRequired,
      experienceRequired,
      salary,
    });
    return {
      job,
      statusCode: 201,
    };
  }

  const payload = {
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
  };

  job.overwrite(payload);
  await job.save();

  return {
    job: { ...job._doc, id: job._id },
    statusCode: 200,
  };
};

module.exports = {
  create,
  deleteItem,
  updateItem,
};
