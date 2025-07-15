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
  author,
}) => {
  const job = await Job({
    title,
    description,
    location,
    jobType,
    skillsRequired,
    experienceRequired,
    salary,
    author,
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
    author,
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
      author,
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
    author,
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
    author,
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
    author,
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

const count = ({ search = "" }) => {
  const filter = {
    title: { $regex: search, $options: "i" },
  };
  return Job.countDocuments(filter);
};

const findSingle = async ({ id, expand = "" }) => {
  if (!id) throw new Error("Id is required");

  const expandFields = expand.split(",").map((item) => item.trim());

  const job = await Job.findById(id).lean();

  if (!job) throw notFound();

  return job;
};

const checkOwnership = async ({ resourceId, userId }) => {
  const job = await Job.findById(resourceId);

  if (!job) throw notFound("Job not found");

  if (job._doc.author.toString() === userId) {
    return true;
  }
  return false;

  console.log("done");
};

module.exports = {
  create,
  deleteItem,
  updateItem,
  updateItemUsingPatch,
  findAll,
  count,
  findSingle,
  checkOwnership,
};
