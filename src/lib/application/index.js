const { Application, Job } = require("../../model");
const { badRequest, notFound, authorizationError } = require("../../utils/error");

const populateApplication = (query) =>
  query
    .populate("job", "title location jobType salary author createdAt updatedAt")
    .populate("applicant", "username email role status createdAt");

const getApplication = async (id) => {
  const application = await populateApplication(Application.findById(id));

  if (!application) {
    throw notFound("Application not found");
  }

  return { ...application._doc, id: application.id };
};

const applyToJob = async ({ jobId, applicantId, coverLetter = "" }) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw notFound("Job not found");
  }

  if (job.author?.toString() === applicantId) {
    throw badRequest("You cannot apply to your own job");
  }

  const existing = await Application.findOne({
    job: jobId,
    applicant: applicantId,
  });

  if (existing) {
    throw badRequest("You have already applied to this job");
  }

  const application = new Application({
    job: jobId,
    applicant: applicantId,
    coverLetter,
  });

  await application.save();

  return getApplication(application.id);
};

const findMine = async ({ applicantId }) => {
  const applications = await populateApplication(
    Application.find({ applicant: applicantId }).sort("-createdAt")
  );

  return applications.map((application) => ({
    ...application._doc,
    id: application.id,
  }));
};

const findForJob = async ({ jobId, user }) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw notFound("Job not found");
  }

  if (user.role !== "admin" && job.author?.toString() !== user.id) {
    throw authorizationError("Operation not allowed");
  }

  const applications = await populateApplication(
    Application.find({ job: jobId }).sort("-createdAt")
  );

  return applications.map((application) => ({
    ...application._doc,
    id: application.id,
  }));
};

const updateStatus = async ({ applicationId, status, user }) => {
  const application = await Application.findById(applicationId).populate("job");

  if (!application) {
    throw notFound("Application not found");
  }

  const author = application.job?.author?.toString();

  if (user.role !== "admin" && author !== user.id) {
    throw authorizationError("Operation not allowed");
  }

  application.status = status;
  await application.save();

  return getApplication(application.id);
};

const count = (filter = {}) => Application.countDocuments(filter);

module.exports = {
  applyToJob,
  findMine,
  findForJob,
  updateStatus,
  count,
};
