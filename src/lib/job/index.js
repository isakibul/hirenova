const { isValidObjectId } = require("mongoose");
const { Job } = require("../../model");
const { notFound } = require("../../utils/error");

const create = async ({
  title,
  description,
  location,
  jobType,
  skillsRequired,
  experienceRequired,
  experienceMin,
  experienceMax,
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
    experienceMin,
    experienceMax,
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
    experienceMin,
    experienceMax,
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
      experienceMin,
      experienceMax,
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
    experienceMin,
    experienceMax,
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
    experienceMin,
    experienceMax,
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
    experienceMin,
    experienceMax,
    salary,
    author,
  };

  Object.keys(payload).forEach((key) => {
    job[key] = payload[key] ?? job[key];
  });

  await job.save();
  return { ...job._doc, id: job.id };
};

const allowedJobTypes = ["full-time", "part-time", "remote", "contract"];
const allowedSortFields = [
  "createdAt",
  "updatedAt",
  "title",
  "salary",
  "experienceRequired",
  "experienceMin",
  "experienceMax",
];

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getNumberFilter = ({ min, max }) => {
  const filter = {};

  if (min !== undefined && min !== "") {
    const minValue = Number(min);

    if (Number.isFinite(minValue)) {
      filter.$gte = minValue;
    }
  }

  if (max !== undefined && max !== "") {
    const maxValue = Number(max);

    if (Number.isFinite(maxValue)) {
      filter.$lte = maxValue;
    }
  }

  return Object.keys(filter).length ? filter : undefined;
};

const getJobFilter = ({
  search = "",
  location = "",
  jobType = "",
  skills = "",
  minSalary,
  maxSalary,
  minExperience,
  maxExperience,
  author,
}) => {
  const filter = {};
  const trimmedSearch = search.trim();
  const trimmedLocation = location.trim();
  const jobTypes = String(jobType)
    .split(",")
    .map((type) => type.trim())
    .filter((type) => allowedJobTypes.includes(type));
  const skillList = String(skills)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const salaryFilter = getNumberFilter({ min: minSalary, max: maxSalary });
  const hasMinExperience = minExperience !== undefined && minExperience !== "";
  const hasMaxExperience = maxExperience !== undefined && maxExperience !== "";
  const minExperienceValue = Number(minExperience);
  const maxExperienceValue = Number(maxExperience);

  if (trimmedSearch) {
    const searchRegex = { $regex: escapeRegExp(trimmedSearch), $options: "i" };

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { location: searchRegex },
      { skillsRequired: searchRegex },
    ];
  }

  if (trimmedLocation) {
    filter.location = { $regex: escapeRegExp(trimmedLocation), $options: "i" };
  }

  if (jobTypes.length) {
    filter.jobType = { $in: jobTypes };
  }

  if (skillList.length) {
    filter.skillsRequired = {
      $all: skillList.map((skill) => new RegExp(escapeRegExp(skill), "i")),
    };
  }

  if (salaryFilter) {
    filter.salary = salaryFilter;
  }

  if (
    (hasMinExperience && Number.isFinite(minExperienceValue)) ||
    (hasMaxExperience && Number.isFinite(maxExperienceValue))
  ) {
    const experienceConditions = [];

    if (hasMinExperience && Number.isFinite(minExperienceValue)) {
      experienceConditions.push({
        $or: [
          { experienceMax: { $gte: minExperienceValue } },
          {
            experienceMax: { $exists: false },
            experienceRequired: { $gte: minExperienceValue },
          },
        ],
      });
    }

    if (hasMaxExperience && Number.isFinite(maxExperienceValue)) {
      experienceConditions.push({
        $or: [
          { experienceMin: { $lte: maxExperienceValue } },
          {
            experienceMin: { $exists: false },
            experienceRequired: { $lte: maxExperienceValue },
          },
        ],
      });
    }

    if (experienceConditions.length) {
      filter.$and = [...(filter.$and ?? []), ...experienceConditions];
    }
  }

  if (author && isValidObjectId(author)) {
    filter.author = author;
  }

  return filter;
};

const findAll = async ({
  page,
  limit,
  sortType,
  sortBy,
  search,
  location,
  jobType,
  skills,
  minSalary,
  maxSalary,
  minExperience,
  maxExperience,
  author,
}) => {
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const filter = getJobFilter({
    search,
    location,
    jobType,
    skills,
    minSalary,
    maxSalary,
    minExperience,
    maxExperience,
    author,
  });

  const jobs = await Job.find(filter)
    .sort(`${sortType === "dsc" ? "-" : ""}${safeSortBy}`)
    .skip(page * limit - limit)
    .limit(limit);

  return jobs.map((job) => ({
    ...job._doc,
    id: job.id,
  }));
};

const count = ({
  search = "",
  location = "",
  jobType = "",
  skills = "",
  minSalary,
  maxSalary,
  minExperience,
  maxExperience,
  author,
}) => {
  const filter = getJobFilter({
    search,
    location,
    jobType,
    skills,
    minSalary,
    maxSalary,
    minExperience,
    maxExperience,
    author,
  });

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
