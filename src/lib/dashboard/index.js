const { User, Job, Application, SavedJob } = require("../../model");

const getAdminSummary = async () => {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalSavedJobs,
    pendingUsers,
    activeUsers,
    suspendedUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    SavedJob.countDocuments(),
    User.countDocuments({ status: "pending" }),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "suspended" }),
  ]);

  return {
    totalUsers,
    totalJobs,
    totalApplications,
    totalSavedJobs,
    pendingUsers,
    activeUsers,
    suspendedUsers,
  };
};

const getEmployerSummary = async (userId) => {
  const jobs = await Job.find({ author: userId }).select("_id");
  const jobIds = jobs.map((job) => job._id);
  const [totalJobs, totalApplications] = await Promise.all([
    Job.countDocuments({ author: userId }),
    Application.countDocuments({ job: { $in: jobIds } }),
  ]);

  return {
    totalJobs,
    totalApplications,
  };
};

const getJobseekerSummary = async (userId) => {
  const [totalApplications, totalSavedJobs] = await Promise.all([
    Application.countDocuments({ applicant: userId }),
    SavedJob.countDocuments({ user: userId }),
  ]);

  return {
    totalApplications,
    totalSavedJobs,
  };
};

module.exports = {
  getAdminSummary,
  getEmployerSummary,
  getJobseekerSummary,
};
