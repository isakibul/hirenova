const { Application, Job, User } = require("../../model");
const { badRequest, notFound, authorizationError } = require("../../utils/error");
const notificationService = require("../notification");

const isAdminRole = (role) => role === "admin" || role === "superadmin";

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

  if (job.status && job.status !== "open") {
    throw badRequest("This job is closed");
  }

  if (
    job.approvalStatus &&
    job.approvalStatus !== "approved"
  ) {
    throw badRequest("This job is not accepting applications yet");
  }

  if (job.expiresAt && job.expiresAt <= new Date()) {
    throw badRequest("This job has expired");
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

  if (job.author) {
    const applicant = await User.findById(applicantId).select("username email");
    const applicantName =
      applicant?.username || applicant?.email || "A candidate";

    await notificationService.createNotification({
      recipient: job.author,
      type: "application_submitted",
      title: "New application received",
      message: `${applicantName} applied to ${job.title}.`,
      link: `/manage-jobs/${job.id}/applications`,
      metadata: {
        job: job.id,
        application: application.id,
        applicant: applicantId,
      },
    });
  }

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

  if (!isAdminRole(user.role) && job.author?.toString() !== user.id) {
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

  if (!isAdminRole(user.role) && author !== user.id) {
    throw authorizationError("Operation not allowed");
  }

  const previousStatus = application.status;
  application.status = status;
  await application.save();

  if (previousStatus !== status && application.applicant) {
    await notificationService.createNotification({
      recipient: application.applicant,
      type: "application_status",
      title: "Application status updated",
      message: `Your application for ${application.job.title} is now ${status}.`,
      link: `/applications`,
      metadata: {
        job: application.job.id,
        application: application.id,
        status,
      },
    });
  }

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
