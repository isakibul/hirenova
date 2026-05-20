const assert = require("node:assert/strict");
const { test } = require("node:test");

const { Application, Conversation, Job, Notification, SavedJob, User } = require("../src/model");
const applicationService = require("../src/modules/applications/applications.service");
const jobService = require("../src/modules/jobs/jobs.service");
const jobApproval = require("../src/modules/jobs/approval");
const messageService = require("../src/modules/messages/messages.service");
const newsletterService = require("../src/modules/newsletters/newsletters.service");
const notificationService = require("../src/modules/notifications/notifications.service");
const savedJobService = require("../src/modules/saved-jobs/saved-jobs.service");
const userService = require("../src/modules/users/users.service");
const dashboardService = require("../src/modules/dashboard/dashboard.service");
const { NewsletterCampaign, NewsletterSubscription } = require("../src/model");

const objectId = (value) => ({
  toString() {
    return value;
  },
});

const participant = (value, data = {}) => ({
  _id: objectId(value),
  id: value,
  _doc: { ...data, _id: objectId(value), id: value },
  toString() {
    return value;
  },
});

const createQuery = (result, hooks = {}) => {
  const query = {
    populate() {
      return query;
    },
    select() {
      return query;
    },
    sort() {
      return query;
    },
    skip() {
      return query;
    },
    limit() {
      return query;
    },
    lean() {
      hooks.lean?.();
      return query;
    },
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
    catch(reject) {
      return Promise.resolve(result).catch(reject);
    },
  };

  return query;
};

const createDoc = (data) => ({
  ...data,
  _doc: data,
  _id: data._id ?? objectId(data.id),
  id: data.id ?? data._id?.toString?.(),
  async save() {
    this.saved = true;
    this._doc = Object.fromEntries(
      Object.entries(this).filter(([key]) => !["saved", "_doc"].includes(key)),
    );
    return this;
  },
});

test("application service rejects invalid apply attempts before writing", async (t) => {
  t.mock.method(Job, "findById", async () =>
    createDoc({
      id: "job-1",
      title: "Backend Engineer",
      status: "closed",
      approvalStatus: "approved",
      author: objectId("employer-1"),
    }),
  );

  await assert.rejects(
    applicationService.applyToJob({
      jobId: "job-1",
      applicantId: "candidate-1",
      coverLetter: "Hello",
    }),
    /This job is closed/,
  );
});

test("application service lists and updates authorized applications", async (t) => {
  const application = createDoc({
    id: "app-1",
    applicant: objectId("candidate-1"),
    status: "pending",
    job: {
      id: "job-1",
      title: "Backend Engineer",
      author: objectId("employer-1"),
    },
  });
  let notified;

  t.mock.method(Application, "find", () => createQuery([application]));
  t.mock.method(Application, "findById", () => createQuery(application));
  t.mock.method(notificationService, "createNotification", async (payload) => {
    notified = payload;
  });

  const mine = await applicationService.findMine({ applicantId: "candidate-1" });
  const updated = await applicationService.updateStatus({
    applicationId: "app-1",
    status: "shortlisted",
    user: { id: "employer-1", role: "employer" },
  });

  assert.equal(mine[0].id, "app-1");
  assert.equal(updated.status, "shortlisted");
  assert.equal(application.saved, true);
  assert.equal(notified.type, "application_status");
  assert.equal(notified.recipient.toString(), "candidate-1");
});

test("job service builds safe filters and updates lifecycle notifications", async (t) => {
  let capturedFilter;
  let notificationBatch;
  const job = createDoc({
    id: "job-1",
    title: "Platform Engineer",
    status: "open",
    approvalStatus: "approved",
    author: objectId("employer-1"),
  });

  t.mock.method(Job, "find", (filter) => {
    capturedFilter = filter;
    return createQuery([job]);
  });
  t.mock.method(Job, "countDocuments", async (filter) => {
    capturedFilter = filter;
    return 3;
  });
  t.mock.method(Job, "findById", async () => job);
  t.mock.method(Application, "find", () =>
    createQuery([
      { applicant: objectId("candidate-1") },
      { applicant: objectId("candidate-1") },
      { applicant: objectId("candidate-2") },
    ]),
  );
  t.mock.method(notificationService, "createManyNotifications", async (items) => {
    notificationBatch = items;
  });

  const jobs = await jobService.findAll({
    page: 1,
    limit: 10,
    sortType: "asc",
    sortBy: "notAllowed",
    search: "React",
    location: "Remote",
    jobType: "remote,invalid",
    skills: "Node.js, MongoDB",
    minSalary: "90000",
    maxSalary: "150000",
    minExperience: "2",
    maxExperience: "5",
  });
  assert.equal(capturedFilter.jobType.$in[0], "remote");
  const total = await jobService.count({ search: "React", includeClosed: true });
  const closed = await jobService.updateStatus({
    id: "job-1",
    status: "closed",
    expiresAt: new Date("2027-01-01T00:00:00.000Z"),
  });

  assert.equal(jobs[0].id, "job-1");
  assert.equal(total, 3);
  assert.equal(capturedFilter.$or[0].title.$regex, "React");
  assert.equal(closed.status, "closed");
  assert.equal(notificationBatch.length, 2);
});

test("job approval and ownership flows update auditable state", async (t) => {
  let notified;
  const job = createDoc({
    id: "job-2",
    title: "Data Engineer",
    author: objectId("employer-2"),
    approvalHistory: [],
  });

  t.mock.method(Job, "findById", async () => job);
  t.mock.method(notificationService, "createNotification", async (payload) => {
    notified = payload;
  });

  const approved = await jobService.updateApproval({
    id: "job-2",
    approvalStatus: "approved",
    reviewer: { id: "admin-1", role: "admin" },
  });
  const owned = await jobService.checkOwnership({
    resourceId: "job-2",
    userId: "employer-2",
  });

  assert.equal(job.approvalStatus, "approved");
  assert.equal(job.reviewedBy, "admin-1");
  assert.equal(job.approvalHistory.length, 1);
  assert.equal(notified.type, "job_approved");
  assert.equal(owned, true);
});

test("saved job service enforces uniqueness and lists saved jobs", async (t) => {
  const job = createDoc({ id: "job-1", title: "Frontend Engineer" });
  const saved = createDoc({ id: "saved-1", job: "job-1", user: "user-1" });
  let savedNotification;

  t.mock.method(Job, "findById", async () => job);
  t.mock.method(SavedJob, "findOne", async () => null);
  t.mock.method(SavedJob.prototype, "save", async function save() {
    this._id = objectId("saved-new");
    this._doc = { job: this.job, user: this.user };
    return this;
  });
  t.mock.method(SavedJob, "find", () => createQuery([saved]));
  t.mock.method(notificationService, "createNotification", async (payload) => {
    savedNotification = payload;
  });

  const created = await savedJobService.saveJob({
    jobId: "job-1",
    userId: "user-1",
  });
  const mine = await savedJobService.findMine({ userId: "user-1" });

  assert.equal(savedNotification.metadata.job, "job-1");
  assert.equal(savedNotification.type, "job_saved");
  assert.equal(mine[0].id, "saved-1");
});

test("notification service serializes create, read, and list flows", async (t) => {
  const notification = createDoc({
    id: "notification-1",
    recipient: objectId("user-1"),
    title: "Hi",
    message: "There",
    readAt: null,
  });

  t.mock.method(Notification.prototype, "save", async function save() {
    this._id = objectId("notification-new");
    this._doc = {
      recipient: this.recipient,
      title: this.title,
      message: this.message,
      readAt: this.readAt ?? null,
    };
    return this;
  });
  t.mock.method(Notification, "insertMany", async (items) =>
    items.map((item, index) => createDoc({ ...item, id: `bulk-${index}` })),
  );
  t.mock.method(Notification, "find", () => createQuery([notification]));
  t.mock.method(Notification, "findById", async () => notification);
  t.mock.method(Notification, "updateMany", async () => ({ modifiedCount: 4 }));
  t.mock.method(Notification, "countDocuments", async () => 2);

  const created = await notificationService.createNotification({
    recipient: "user-1",
    title: "Hi",
    message: "There",
  });
  const bulk = await notificationService.createManyNotifications([
    { recipient: "user-1", title: "A", message: "B" },
    { title: "invalid", message: "missing recipient" },
  ]);
  const mine = await notificationService.findMine({ userId: "user-1", limit: 500 });
  const unread = await notificationService.unreadCount({ userId: "user-1" });
  const read = await notificationService.markAsRead({
    notificationId: "notification-1",
    userId: "user-1",
  });
  const allRead = await notificationService.markAllAsRead({ userId: "user-1" });

  assert.equal(created.message, "There");
  assert.equal(bulk.length, 1);
  assert.equal(mine[0].isRead, false);
  assert.equal(unread, 2);
  assert.equal(read.isRead, true);
  assert.equal(allRead.modifiedCount, 4);
});

test("message service handles conversation reads, sends, and soft deletes", async (t) => {
  const participantA = participant("sender-1", { username: "Sender" });
  const participantB = participant("user-2", { username: "Receiver" });
  const conversation = createDoc({
    id: "conversation-1",
    participants: [participantA, participantB],
    jobseeker: participantB,
    startedBy: participantA,
    messages: [],
    unreadBy: [objectId("sender-1")],
    deletedBy: [],
  });
  let notifications;

  t.mock.method(Conversation, "find", () => createQuery([conversation]));
  t.mock.method(Conversation, "findById", () => createQuery(conversation));
  t.mock.method(notificationService, "createManyNotifications", async (items) => {
    notifications = items;
  });

  const mine = await messageService.findMine({ userId: "sender-1" });
  const one = await messageService.getOne({
    conversationId: "conversation-1",
    userId: "sender-1",
  });
  const sent = await messageService.sendMessage({
    conversationId: "conversation-1",
    sender: { id: "sender-1", username: "Sender" },
    body: " Hello ",
  });
  const deleted = await messageService.deleteForMe({
    conversationId: "conversation-1",
    userId: "sender-1",
  });

  assert.equal(mine[0].id, "conversation-1");
  assert.equal(one.isUnread, false);
  assert.equal(conversation.messages.at(-1).body, "Hello");
  assert.equal(notifications.length, 1);
  assert.equal(deleted.id, "conversation-1");
  assert.equal(conversation.deletedBy[0], "sender-1");
});

test("newsletter service manages subscriptions and campaign outcomes", async (t) => {
  const subscription = createDoc({
    id: "sub-1",
    _id: objectId("sub-1"),
    email: "person@example.com",
    status: "subscribed",
  });
  const campaign = createDoc({
    id: "campaign-1",
    _id: objectId("campaign-1"),
    subject: "Hiring news",
    status: "sent",
  });

  t.mock.method(NewsletterSubscription, "findOneAndUpdate", async () => subscription);
  t.mock.method(NewsletterSubscription, "find", () => createQuery([subscription]));
  t.mock.method(NewsletterSubscription, "countDocuments", async () => 1);
  t.mock.method(NewsletterSubscription, "findByIdAndDelete", async () => subscription);
  t.mock.method(NewsletterSubscription, "findByIdAndUpdate", async () => subscription);
  t.mock.method(NewsletterCampaign, "create", async (payload) =>
    createDoc({ ...payload, id: "campaign-new", _id: objectId("campaign-new") }),
  );
  t.mock.method(NewsletterCampaign, "find", () => createQuery([campaign]));
  t.mock.method(NewsletterCampaign, "findByIdAndDelete", async () => campaign);

  const subscribed = await newsletterService.subscribe("person@example.com");
  const all = await newsletterService.findAll({ page: 1, limit: 10 });
  const total = await newsletterService.count({ status: "subscribed" });
  const updated = await newsletterService.updateStatus("sub-1", "unsubscribed");
  await assert.rejects(
    newsletterService.sendCampaign({
      subject: "",
      previewText: "Fresh jobs",
      body: "",
      sentBy: "admin-1",
    }),
    /Campaign subject and body are required/,
  );
  const campaigns = await newsletterService.findCampaigns({ limit: 3 });
  const removedCampaign = await newsletterService.removeCampaign("campaign-1");
  const removedSubscription = await newsletterService.remove("sub-1");

  assert.equal(subscribed.id, "sub-1");
  assert.equal(all[0].email, "person@example.com");
  assert.equal(total, 1);
  assert.equal(updated.id, "sub-1");
  assert.equal(campaigns[0].id, "campaign-1");
  assert.equal(removedCampaign.id, "campaign-1");
  assert.equal(removedSubscription.id, "sub-1");
});

test("user service covers identity, profile, and role-review workflows", async (t) => {
  const user = createDoc({
    id: "user-1",
    _id: objectId("user-1"),
    username: "candidate1",
    email: "candidate@example.com",
    role: "jobseeker",
    status: "active",
    skills: ["Node.js"],
    roleChangeRequest: {
      requestedRole: "employer",
      status: "pending",
      requestedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  });
  let createdNotifications;
  let reviewedNotification;

  t.mock.method(User, "findOne", () => createQuery(user));
  t.mock.method(User, "findById", (id) => {
    if (id === "missing") return createQuery(null);
    return createQuery(user);
  });
  t.mock.method(User, "find", () => createQuery([user]));
  t.mock.method(User, "countDocuments", async () => 1);
  t.mock.method(User, "findByIdAndUpdate", async () => user);
  t.mock.method(User, "findByIdAndDelete", async () => user);
  t.mock.method(Notification, "findOne", async () => null);
  t.mock.method(notificationService, "createManyNotifications", async (items) => {
    createdNotifications = items;
  });
  t.mock.method(notificationService, "createNotification", async (payload) => {
    reviewedNotification = payload;
  });
  t.mock.method(Job, "find", () =>
    createQuery([
      {
        _id: objectId("job-1"),
        title: "Backend Engineer",
      },
    ]),
  );

  const byEmail = await userService.findUserByEmail(" Candidate@Example.com ");
  const all = await userService.getAllUser({
    page: 1,
    limit: 10,
    sortType: "asc",
    sortBy: "createdAt",
    search: "candidate",
    role: "jobseeker",
  });
  const profile = await userService.getJobseekerProfile("user-1");
  await assert.rejects(userService.getCompanyProfile("user-1"), /Company not found/);
  const updated = await userService.updateProfile("user-1", {
    skills: ["Node.js", "React"],
  });
  const requested = await userService.requestEmployerRoleChange("user-1", "I hire now");
  const roleRequests = await userService.getRoleChangeRequests({
    page: 1,
    limit: 10,
    sortType: "dsc",
    sortBy: "createdAt",
    status: "pending",
  });
  const reviewed = await userService.reviewRoleChangeRequest({
    id: "user-1",
    reviewerId: "admin-1",
    decision: "approved",
  });
  await userService.touchLastSeen("user-1");
  const removed = await userService.removeUser("user-1");

  assert.equal(byEmail.id, "user-1");
  assert.equal(all[0].roleChangeRequest.status, "pending");
  assert.equal(profile.id, "user-1");
  assert.deepEqual(updated.skills, ["Node.js", "React"]);
  assert.equal(requested.roleChangeRequest.note, "I hire now");
  assert.equal(roleRequests[0].id, "user-1");
  assert.equal(createdNotifications.length, 1);
  assert.equal(reviewed.role, "employer");
  assert.equal(reviewedNotification.type, "role_change_approved");
  assert.equal(removed.id, "user-1");
});

test("job approval helpers build filters, preserve decline notes, and notify admins", async (t) => {
  const job = {
    id: "job-1",
    title: "Backend Engineer",
    approvalStatus: "declined",
    rejectionNote: "Missing salary",
    reviewedBy: "admin-1",
    reviewedAt: new Date("2026-01-01T00:00:00.000Z"),
    approvalHistory: [],
  };
  let notifications;

  t.mock.method(User, "find", () =>
    createQuery([{ _id: objectId("admin-1") }, { _id: objectId("admin-2") }]),
  );
  t.mock.method(notificationService, "createManyNotifications", async (items) => {
    notifications = items;
  });

  assert.deepEqual(jobApproval.getApprovalFilter("pending"), {
    approvalStatus: "pending",
  });
  assert.deepEqual(jobApproval.getApprovalFilter("public"), {
    $or: [
      { approvalStatus: "approved" },
      { approvalStatus: { $exists: false } },
      { approvalStatus: null },
    ],
  });
  assert.deepEqual(jobApproval.getApprovalFilter("ignored"), {});
  assert.equal(jobApproval.isAdminRole("superadmin"), true);

  jobApproval.preserveCurrentDeclineNote(job);
  jobApproval.addApprovalHistory({
    job,
    action: "submitted",
    note: "Updated",
    actor: "employer-1",
    actorRole: "employer",
  });
  await jobApproval.notifyAdminsForReview(job, { isResubmission: true });

  assert.equal(job.approvalHistory[0].action, "declined");
  assert.equal(job.approvalHistory[1].action, "submitted");
  assert.equal(notifications.length, 2);
  assert.equal(notifications[0].title, "Job resubmitted");
});

test("dashboard service summarizes admin, employer, and jobseeker metrics", async (t) => {
  const jobIds = [{ _id: objectId("job-1") }, { _id: objectId("job-2") }];
  const counts = {
    User: 0,
    Job: 0,
    Application: 0,
    SavedJob: 0,
  };

  t.mock.method(User, "countDocuments", async () => ++counts.User);
  t.mock.method(Job, "countDocuments", async () => ++counts.Job);
  t.mock.method(Application, "countDocuments", async () => ++counts.Application);
  t.mock.method(SavedJob, "countDocuments", async () => ++counts.SavedJob);
  t.mock.method(Job, "find", () => createQuery(jobIds));

  const admin = await dashboardService.getAdminSummary();
  const employer = await dashboardService.getEmployerSummary("employer-1");
  const jobseeker = await dashboardService.getJobseekerSummary("candidate-1");

  assert.equal(admin.totalUsers, 1);
  assert.equal(admin.totalJobs, 1);
  assert.equal(admin.totalApplications, 1);
  assert.equal(admin.totalSavedJobs, 1);
  assert.equal(employer.totalJobs, 2);
  assert.equal(employer.totalApplications, 2);
  assert.equal(jobseeker.totalApplications, 3);
  assert.equal(jobseeker.totalSavedJobs, 2);
});
