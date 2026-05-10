const { isValidObjectId } = require("mongoose");
const { Application, Job, User } = require("../../model");
const { notFound } = require("../../utils/error");
const notificationService = require("../notification");

const isAdminRole = (role) => role === "admin" || role === "superadmin";

const getApprovalFilter = (approvalStatus) => {
  if (["pending", "approved", "declined"].includes(approvalStatus)) {
    return { approvalStatus };
  }

  if (approvalStatus === "public") {
    return {
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
        { approvalStatus: null },
      ],
    };
  }

  return {};
};

const getPublicApprovalFilter = () => ({
    $or: [
      { approvalStatus: "approved" },
      { approvalStatus: { $exists: false } },
      { approvalStatus: null },
    ],
});

const notifyAdminsForReview = async (job, { isResubmission = false } = {}) => {
  const admins = await User.find({
    role: { $in: ["admin", "superadmin"] },
    status: "active",
  }).select("_id");

  await notificationService.createManyNotifications(
    admins.map((admin) => ({
      recipient: admin._id,
      type: "job_pending_review",
      title: isResubmission ? "Job resubmitted" : "New job awaiting approval",
      message: isResubmission
        ? `${job.title} was updated and resubmitted for review.`
        : `${job.title} was submitted for review.`,
      link: "/manage-jobs?approval_status=pending",
      metadata: {
        job: job.id,
      },
    }))
  );
};

const addApprovalHistory = ({ job, action, note = "", actor, actorRole }) => {
  job.approvalHistory = [
    ...(job.approvalHistory ?? []),
    {
      action,
      note,
      actor,
      actorRole,
      createdAt: new Date(),
    },
  ];
};

const preserveCurrentDeclineNote = (job) => {
  if (job.approvalStatus !== "declined" || !job.rejectionNote) {
    return;
  }

  const hasCurrentNote = (job.approvalHistory ?? []).some(
    (item) => item.action === "declined" && item.note === job.rejectionNote
  );

  if (hasCurrentNote) {
    return;
  }

  job.approvalHistory = [
    ...(job.approvalHistory ?? []),
    {
      action: "declined",
      note: job.rejectionNote,
      actor: job.reviewedBy,
      actorRole: "admin",
      createdAt: job.reviewedAt ?? new Date(),
    },
  ];
};

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
  status,
  expiresAt,
  author,
  authorRole,
}) => {
  const authorIsAdmin = isAdminRole(authorRole);
  const approvalStatus = authorIsAdmin ? "approved" : "pending";
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
    status,
    approvalStatus,
    rejectionNote: "",
    reviewedAt: authorIsAdmin ? new Date() : undefined,
    reviewedBy: authorIsAdmin ? author : undefined,
    approvalHistory: [
      {
        action: authorIsAdmin ? "approved" : "submitted",
        note: authorIsAdmin
          ? "Created by admin and approved automatically."
          : "Submitted for admin review.",
        actor: author,
        actorRole: authorRole,
        createdAt: new Date(),
      },
    ],
    expiresAt,
    closedAt: status === "closed" ? new Date() : undefined,
    author,
  });

  await job.save();

  if (approvalStatus === "pending") {
    await notifyAdminsForReview(job);
  }

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
    status,
    expiresAt,
    author,
    authorRole,
  }
) => {
  const job = await Job.findById(id);
  const authorIsAdmin = isAdminRole(authorRole);

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
      status,
      expiresAt,
      author,
      authorRole,
    });

    return {
      job,
      statusCode: 201,
    };
  }
  const wasDeclined = job.approvalStatus === "declined";
  if (!authorIsAdmin) {
    preserveCurrentDeclineNote(job);
  }
  const approvalHistory = job.approvalHistory ?? [];

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
    status,
    approvalStatus:
      authorIsAdmin ? job.approvalStatus ?? "approved" : "pending",
    rejectionNote: authorIsAdmin ? job.rejectionNote ?? "" : "",
    reviewedAt: authorIsAdmin ? job.reviewedAt : undefined,
    reviewedBy: authorIsAdmin ? job.reviewedBy : undefined,
    approvalHistory,
    expiresAt,
    closedAt: status === "closed" ? new Date() : undefined,
    author: authorIsAdmin ? job.author : author,
  };

  job.overwrite(payload);
  if (!authorIsAdmin) {
    addApprovalHistory({
      job,
      action: wasDeclined ? "resubmitted" : "submitted",
      note: wasDeclined
        ? "Updated after decline and resubmitted for admin review."
        : "Updated and sent for admin review.",
      actor: author,
      actorRole: authorRole,
    });
  }
  await job.save();

  if (!authorIsAdmin) {
    await notifyAdminsForReview(job, { isResubmission: wasDeclined });
  }

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
    status,
    expiresAt,
    author,
    authorRole,
  }
) => {
  const job = await Job.findById(id);
  const authorIsAdmin = isAdminRole(authorRole);

  if (!job) {
    throw notFound();
  }

  const wasDeclined = job.approvalStatus === "declined";
  if (!authorIsAdmin) {
    preserveCurrentDeclineNote(job);
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
    status,
    expiresAt,
    author: authorIsAdmin ? job.author : author,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      job[key] = payload[key];
    }
  });

  if (status !== undefined) {
    job.closedAt = status === "closed" ? new Date() : undefined;
  }

  if (!authorIsAdmin) {
    job.approvalStatus = "pending";
    job.rejectionNote = "";
    job.reviewedAt = undefined;
    job.reviewedBy = undefined;
    addApprovalHistory({
      job,
      action: wasDeclined ? "resubmitted" : "submitted",
      note: wasDeclined
        ? "Updated after decline and resubmitted for admin review."
        : "Updated and sent for admin review.",
      actor: author,
      actorRole: authorRole,
    });
  }

  await job.save();

  if (!authorIsAdmin) {
    await notifyAdminsForReview(job, { isResubmission: wasDeclined });
  }

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
  "expiresAt",
  "status",
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
  status = "",
  approvalStatus = "",
  includeClosed = false,
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

  if (!includeClosed) {
    filter.$and = [
      ...(filter.$and ?? []),
      getPublicApprovalFilter(),
      {
        $or: [
          { status: "open" },
          { status: { $exists: false } },
          { status: null },
        ],
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } },
        ],
      },
    ];
  } else {
    const approvalFilter = getApprovalFilter(approvalStatus);

    if (Object.keys(approvalFilter).length) {
      filter.$and = [...(filter.$and ?? []), approvalFilter];
    }
  }

  if (includeClosed && status === "open") {
    filter.$and = [
      ...(filter.$and ?? []),
      {
        $or: [
          { status: "open" },
          { status: { $exists: false } },
          { status: null },
        ],
      },
    ];
  } else if (includeClosed && ["open", "closed"].includes(status)) {
    filter.status = status;
  }

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
  status,
  approvalStatus,
  includeClosed,
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
    status,
    approvalStatus,
    includeClosed,
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
  status,
  approvalStatus,
  includeClosed,
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
    status,
    approvalStatus,
    includeClosed,
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

const updateStatus = async ({ id, status, expiresAt }) => {
  const job = await Job.findById(id);

  if (!job) {
    throw notFound("Job not found");
  }

  const previousStatus = job.status;
  job.status = status;
  job.closedAt = status === "closed" ? new Date() : undefined;

  if (expiresAt !== undefined) {
    job.expiresAt = expiresAt;
  }

  await job.save();

  if (previousStatus !== "closed" && status === "closed") {
    const applications = await Application.find({ job: job.id }).select(
      "applicant"
    );
    const recipientIds = [
      ...new Set(
        applications
          .map((application) => application.applicant?.toString())
          .filter(Boolean)
      ),
    ];

    await notificationService.createManyNotifications(
      recipientIds.map((recipient) => ({
        recipient,
        type: "job_closed",
        title: "Job closed",
        message: `${job.title} is no longer accepting applications.`,
        link: `/jobs/${job.id}`,
        metadata: {
          job: job.id,
        },
      }))
    );
  }

  return { ...job._doc, id: job.id };
};

const updateApproval = async ({ id, approvalStatus, rejectionNote = "", reviewer }) => {
  const job = await Job.findById(id);

  if (!job) {
    throw notFound("Job not found");
  }

  job.approvalStatus = approvalStatus;
  job.rejectionNote = approvalStatus === "declined" ? rejectionNote : "";
  job.reviewedAt = new Date();
  job.reviewedBy = reviewer.id;
  addApprovalHistory({
    job,
    action: approvalStatus,
    note: approvalStatus === "declined" ? rejectionNote : "Approved by admin.",
    actor: reviewer.id,
    actorRole: reviewer.role,
  });

  await job.save();

  await notificationService.createNotification({
    recipient: job.author,
    type: approvalStatus === "approved" ? "job_approved" : "job_declined",
    title:
      approvalStatus === "approved"
        ? "Job approved"
        : "Job declined",
    message:
      approvalStatus === "approved"
        ? `${job.title} is approved and visible to candidates.`
        : `${job.title} was declined. ${rejectionNote}`,
    link: "/manage-jobs",
    metadata: {
      job: job.id,
      approvalStatus,
      rejectionNote: job.rejectionNote,
    },
  });

  return { ...job._doc, id: job.id };
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
  updateStatus,
  updateApproval,
  checkOwnership,
};
