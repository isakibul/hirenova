const { SavedJob, Job } = require("../../model");
const { badRequest, notFound } = require("../../utils/error");

const populateSavedJob = (query) =>
  query.populate("job", "title location jobType salary skillsRequired createdAt updatedAt");

const saveJob = async ({ jobId, userId }) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw notFound("Job not found");
  }

  const existing = await SavedJob.findOne({ job: jobId, user: userId });

  if (existing) {
    throw badRequest("Job is already saved");
  }

  const savedJob = new SavedJob({ job: jobId, user: userId });
  await savedJob.save();

  return { ...savedJob._doc, id: savedJob.id };
};

const removeSavedJob = async ({ jobId, userId }) => {
  const savedJob = await SavedJob.findOneAndDelete({ job: jobId, user: userId });

  if (!savedJob) {
    throw notFound("Saved job not found");
  }

  return savedJob;
};

const findMine = async ({ userId }) => {
  const savedJobs = await populateSavedJob(
    SavedJob.find({ user: userId }).sort("-createdAt")
  );

  return savedJobs.map((savedJob) => ({
    ...savedJob._doc,
    id: savedJob.id,
  }));
};

const count = (filter = {}) => SavedJob.countDocuments(filter);

module.exports = {
  saveJob,
  removeSavedJob,
  findMine,
  count,
};
