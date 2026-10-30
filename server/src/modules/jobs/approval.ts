const { User } = require("../../infrastructure/database/models");
const notificationService = require("../notifications/notifications.service");

const isAdminRole = (role) => role === "admin" || role === "superadmin";

const getApprovalFilter = (approvalStatus) => {
  if (["pending", "approved", "declined"].includes(approvalStatus)) {
    return { approvalStatus };
  }

  if (approvalStatus === "public") {
    return getPublicApprovalFilter();
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
    })),
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
    (item) => item.action === "declined" && item.note === job.rejectionNote,
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

module.exports = {
  addApprovalHistory,
  getApprovalFilter,
  getPublicApprovalFilter,
  isAdminRole,
  notifyAdminsForReview,
  preserveCurrentDeclineNote,
};
