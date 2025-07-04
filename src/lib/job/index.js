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
    throw notFound("Job not found");
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

const updateItemUsingPatch = async (
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
    throw notFound();
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

  Object.keys(payload).forEach((key) => {
    job[key] = payload[key] ?? job[key];
  });

  await job.save();
  return { ...job._doc, id: job.id };
};

const findAll = async ({ page, limit, sortType, sortBy, search }) => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = { title: { $regex: search, $options: "i" } };

  const jobs = await Job.find(filter)
    .sort(sortStr)
    .skip(page * limit - limit)
    .limit(limit);

  return jobs.map((job) => ({
    ...job._doc,
    id: job.id,
  }));
};

module.exports = {
  create,
  deleteItem,
  updateItem,
  updateItemUsingPatch,
  findAll,
};
